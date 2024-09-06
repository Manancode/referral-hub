import { PrismaClient } from '@prisma/client';
import { 
    searchPosts, 
    getSubredditInfo, 
    searchSubreddits, 
    getUserInfo, 
    getUserHistory, 
    getPostComments, 
    getSubredditModerators, 
    getSubredditRules, 
    getSubredditKeywordStats, 
    getSubredditSentiment, 
    getSubredditTopContributors, 
    getSubredditWiki, 
    getUserMultireddits,
    findRelatedSubreddits,
    analyzeUserEngagement
} from './redditApi';
import { sendCSVReport } from '@/app/scheduledTasks';
import { TIER_LIMITS } from './constants';

const prisma = new PrismaClient();

export async function processSearch(job) {
    const { userId, productIdea, keywords, tier } = job.data;
    console.log(`Starting search process for user ${userId}, product idea: ${productIdea}, keywords: ${keywords.join(', ')}, tier: ${tier}`);

    try {
        const project = await prisma.project.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, userId: true },
        });

        if (!project) {
            throw new Error(`No projects found for user ${userId}`);
        }
        console.log(`Project found: ${project.id}`);

        // Find relevant subreddits
        const relatedSubreddits = await searchSubreddits(productIdea);
        console.log(`Found ${relatedSubreddits.data.children.length} related subreddits`);

        const search = await prisma.search.create({
            data: {
                keywords,
                subreddits: relatedSubreddits.data.children.map(subreddit => subreddit.data.display_name),
                project: { connect: { id: project.id } },
                user: { connect: { id: userId } },
            },
        });

        // Analyze and rank subreddits (limit to 5 to reduce processing time)
        const rankedSubreddits = await Promise.all(relatedSubreddits.data.children.slice(0, 5).map(async subreddit => {
            const [info, rules, wiki, moderators, topContributors, keywordStats, sentiment] = await Promise.all([
                getSubredditInfo(subreddit.data.display_name),
                getSubredditRules(subreddit.data.display_name),
                getSubredditWiki(subreddit.data.display_name),
                getSubredditModerators(subreddit.data.display_name),
                getSubredditTopContributors(subreddit.data.display_name),
                getSubredditKeywordStats(subreddit.data.display_name, keywords),
                getSubredditSentiment(subreddit.data.display_name)
            ]);

            const relevance = await calculateSubredditRelevance(subreddit.data, productIdea, keywords, rules, wiki, keywordStats, sentiment);
            
            return {
                ...subreddit.data,
                relevance,
                rules,
                wiki,
                moderators,
                topContributors,
                keywordStats,
                sentiment,
            };
        }));

        rankedSubreddits.sort((a, b) => (b.relevance * Math.log(b.subscribers)) - (a.relevance * Math.log(a.subscribers)));
        const topSubreddits = rankedSubreddits.slice(0, 5);
        console.log(`Top 5 subreddits: ${topSubreddits.map(s => s.display_name).join(', ')}`);

        // Fetch and analyze posts and comments
        const allPosts = [];
        const allComments = [];
        for (const subreddit of topSubreddits) {
            const posts = await searchPosts(`${productIdea} ${keywords.join(' ')}`, subreddit.display_name, undefined, tier);
            allPosts.push(...posts);

            // Fetch comments for each post (limit to 5 comments per post)
            for (const post of posts.slice(0, 5)) {
                const comments = await getPostComments(post.data.id, subreddit.display_name);
                allComments.push(...comments.slice(0, 5));
            }
        }

        // Calculate and filter relevance scores for posts and comments
        const MIN_RELEVANCE_SCORE = 0.2;
        const [scoredPosts, scoredComments] = await Promise.all([
            Promise.all(allPosts.map(async post => {
                const score = await calculateIntegratedRelevanceScore(post.data, keywords, productIdea);
                return { ...post, relevanceScore: score };
            })),
            Promise.all(allComments.map(async comment => {
                const score = await calculateIntegratedRelevanceScore(comment.data, keywords, productIdea);
                return { ...comment, relevanceScore: score };
            }))
        ]);

        const filteredPosts = scoredPosts.filter(post => post.relevanceScore >= MIN_RELEVANCE_SCORE);
        const filteredComments = scoredComments.filter(comment => comment.relevanceScore >= MIN_RELEVANCE_SCORE);

        // Analyze user profiles
        const uniqueUsers = [...new Set([...filteredPosts.map(post => post.data.author), ...filteredComments.map(comment => comment.data.author)])];
        const userProfiles = await Promise.all(
            uniqueUsers.slice(0, 10).map(async username => {
                const [userInfo, userHistory, userMultireddits, userEngagement] = await Promise.all([
                    getUserInfo(username),
                    getUserHistory(username),
                    getUserMultireddits(username),
                    analyzeUserEngagement(username)
                ]);
                const profile = await analyzeUserProfile(userInfo.data, userHistory, userMultireddits, userEngagement, productIdea, keywords);
                return { username, ...profile };
            })
        );

        userProfiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
        const limitedUserProfiles = userProfiles.slice(0, TIER_LIMITS[tier]);

        // Save search results and user profiles
        await saveSearchResults(search.id, filteredPosts, filteredComments, limitedUserProfiles, topSubreddits);

        // Update search usage
        await updateSearchUsage(userId);

        // Send CSV report for paid tiers
        if (tier !== 'free') {
            await sendCSVReport(userId, limitedUserProfiles, filteredPosts, filteredComments);
        }

        // Update job progress
        await job.progress(100);

        return {
            search,
            searchResultsCount: filteredPosts.length + filteredComments.length,
            relevantSubreddits: topSubreddits.map(s => s.display_name),
            userProfilesCount: limitedUserProfiles.length,
        };
    } catch (error) {
        console.error(`Error in processSearch: ${error.message}`);
        throw error;
    }
}


async function saveSearchResults(searchId, posts, comments, userProfiles, topSubreddits) {
    await prisma.searchResult.createMany({
        data: [
            ...posts.map(item => ({
                username: item.data.author,
                postTitle: item.data.title,
                postContent: item.data.selftext || '',
                subreddit: item.data.subreddit,
                relevanceScore: item.relevanceScore,
                searchId,
                isComment: false,
            })),
            ...comments.map(item => ({
                username: item.data.author,
                postTitle: 'Comment',
                postContent: item.data.body || '',
                subreddit: item.data.subreddit,
                relevanceScore: item.relevanceScore,
                searchId,
                isComment: true,
            }))
        ],
    });

    await prisma.userProfile.createMany({
        data: userProfiles.map(profile => ({
            username: profile.username,
            relevanceScore: profile.relevanceScore,
            searchId,
        })),
    });

    await prisma.subredditAnalysis.createMany({
        data: topSubreddits.map(subreddit => ({
            name: subreddit.name,
            subscribers: subreddit.subscribers,
            relevance: subreddit.relevance,
            rules: JSON.stringify(subreddit.rules),
            wiki: subreddit.wiki,
            moderators: JSON.stringify(subreddit.moderators),
            topContributors: JSON.stringify(subreddit.topContributors),
            keywordStats: JSON.stringify(subreddit.keywordStats),
            sentiment: subreddit.sentiment,
            searchId,
        })),
    });
}

async function updateSearchUsage(userId) {
    await prisma.searchUsage.upsert({
        where: { userId },
        update: {
            searchesPerformed: { increment: 1 },
            lastSearchDate: new Date(),
        },
        create: {
            userId,
            searchesPerformed: 1,
            lastSearchDate: new Date(),
            lastResetDate: new Date(),
        },
    });
}

async function calculateSubredditRelevance(subreddit, productIdea, keywords, rules, wiki, keywordStats, sentiment) {
    // Implement your relevance calculation logic here
    // This is a simplified example, you should adjust it based on your specific requirements
    const keywordRelevance = keywords.reduce((acc, keyword) => {
        return acc + (keywordStats[keyword] || 0);
    }, 0) / keywords.length;

    const wikiRelevance = wiki.toLowerCase().includes(productIdea.toLowerCase()) ? 1 : 0;

    const ruleRelevance = rules.some(rule => 
        rule.description.toLowerCase().includes(productIdea.toLowerCase())
    ) ? 1 : 0;

    const sentimentScore = sentiment === 'positive' ? 1 : sentiment === 'neutral' ? 0.5 : 0;

    // You can adjust these weights based on what you consider more important
    const weights = {
        keywordRelevance: 0.4,
        wikiRelevance: 0.3,
        ruleRelevance: 0.2,
        sentimentScore: 0.1
    };

    const relevanceScore = 
        (keywordRelevance * weights.keywordRelevance) +
        (wikiRelevance * weights.wikiRelevance) +
        (ruleRelevance * weights.ruleRelevance) +
        (sentimentScore * weights.sentimentScore);

    return relevanceScore;
}

async function analyzeUserProfile(userInfo, userHistory, userMultireddits, productIdea, keywords) {
    // Implement your user profile analysis logic here
    // This is a simplified example, you should adjust it based on your specific requirements
    const relevantPosts = userHistory.filter(post => 
        post.title.toLowerCase().includes(productIdea.toLowerCase()) ||
        keywords.some(keyword => post.title.toLowerCase().includes(keyword.toLowerCase()))
    );

    const relevantMultireddits = userMultireddits.filter(multireddit => 
        multireddit.name.toLowerCase().includes(productIdea.toLowerCase()) ||
        keywords.some(keyword => multireddit.name.toLowerCase().includes(keyword.toLowerCase()))
    );

    const relevanceScore = (relevantPosts.length / userHistory.length) * 0.7 + 
                           (relevantMultireddits.length / userMultireddits.length) * 0.3;

    return {
        relevanceScore,
        karma: userInfo.link_karma + userInfo.comment_karma,
        accountAge: (Date.now() - userInfo.created_utc * 1000) / (1000 * 60 * 60 * 24), // in days
        relevantPostsCount: relevantPosts.length,
        relevantMultiredditsCount: relevantMultireddits.length
    };
}