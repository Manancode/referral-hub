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
    getUserMultireddits 
} from './redditApi';
import { sendCSVReport } from '@/app/scheduledTasks';
import { TIER_LIMITS } from './constants';
import { redditApiRequest } from './redditApiUtils';
import { calculateIntegratedRelevanceScore, loadModel } from './relevanceCalculator';

const prisma = new PrismaClient();

export async function processSearch(job) {
    const { userId, productIdea, keywords, tier } = job.data;
    console.log(`Starting search process for user ${userId}, product idea: ${productIdea}, keywords: ${keywords.join(', ')}, tier: ${tier}`);

    try {
        await loadModel();

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
        const relatedSubreddits = await redditApiRequest(searchSubreddits, productIdea);
        console.log(`Found ${relatedSubreddits.length} related subreddits`);

        const search = await prisma.search.create({
            data: {
                keywords,
                subreddits: relatedSubreddits.map(subreddit => subreddit.name),
                project: { connect: { id: project.id } },
                user: { connect: { id: userId } },
            },
        });

        // Analyze and rank subreddits
        const rankedSubreddits = await Promise.all(relatedSubreddits.map(async subreddit => {
            const info = await redditApiRequest(getSubredditInfo, subreddit.name);
            const rules = await redditApiRequest(getSubredditRules, subreddit.name);
            const wiki = await redditApiRequest(getSubredditWiki, subreddit.name);
            const moderators = await redditApiRequest(getSubredditModerators, subreddit.name);
            const topContributors = await redditApiRequest(getSubredditTopContributors, subreddit.name);
            const keywordStats = await redditApiRequest(getSubredditKeywordStats, subreddit.name, keywords);
            const sentiment = await redditApiRequest(getSubredditSentiment, subreddit.name);

            const relevance = await calculateSubredditRelevance(subreddit, productIdea, keywords, rules, wiki, keywordStats, sentiment);
            
            return {
                ...subreddit,
                subscribers: info.data.subscribers,
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
        console.log(`Top 5 subreddits: ${topSubreddits.map(s => s.name).join(', ')}`);

        // Fetch and analyze posts and comments
        let allPosts = [];
        let allComments = [];
        for (const subreddit of topSubreddits) {
            const posts = await redditApiRequest(searchPosts, {
                query: `${productIdea} ${keywords.join(' ')}`,
                subreddit: subreddit.name,
                sort: 'relevance',
                time: 'month',
                limit: TIER_LIMITS[tier],
            });
            allPosts = allPosts.concat(posts.data.children);

            // Fetch comments for each post
            for (const post of posts.data.children) {
                const comments = await redditApiRequest(getPostComments, post.data.id, subreddit.name);
                allComments = allComments.concat(comments);
            }
        }

        // Calculate and filter relevance scores for posts and comments
        const MIN_RELEVANCE_SCORE = 0.2;
        allPosts = await Promise.all(allPosts.map(async post => {
            const score = await calculateIntegratedRelevanceScore(post, keywords, productIdea);
            return { ...post, relevanceScore: score.overallScore };
        }));

        allComments = await Promise.all(allComments.map(async comment => {
            const score = await calculateIntegratedRelevanceScore(comment, keywords, productIdea);
            return { ...comment, relevanceScore: score.overallScore };
        }));

        allPosts = allPosts.filter(post => post.relevanceScore >= MIN_RELEVANCE_SCORE);
        allComments = allComments.filter(comment => comment.relevanceScore >= MIN_RELEVANCE_SCORE);

        const userProfiles = await Promise.all(
            [...new Set([...allPosts.map(post => post.data.author), ...allComments.map(comment => comment.data.author)])].map(async username => {
                const userInfo = await redditApiRequest(getUserInfo, username);
                const userHistory = await redditApiRequest(getUserHistory, username);
                const userMultireddits = await redditApiRequest(getUserMultireddits, username);
                const profile = await analyzeUserProfile(userInfo, userHistory, userMultireddits, productIdea, keywords);
                return { username, ...profile };
            })
        );

        userProfiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
        const limitedUserProfiles = userProfiles.slice(0, TIER_LIMITS[tier]);

        // Save search results and user profiles
        await saveSearchResults(search.id, allPosts, allComments, limitedUserProfiles, topSubreddits);

        // Update search usage
        await updateSearchUsage(userId);

        // Send CSV report for paid tiers
        if (tier !== 'free') {
            await sendCSVReport(userId, limitedUserProfiles, allPosts, allComments);
        }

        // Update job progress
        await job.progress(100);

        return {
            search,
            searchResultsCount: allPosts.length + allComments.length,
            relevantSubreddits: topSubreddits.map(s => s.name),
            userProfilesCount: limitedUserProfiles.length,
        };
    } catch (error) {
        console.error(`Error in processSearch: ${error.message}`);
        throw error;
    }
}

async function saveSearchResults(searchId, posts, comments, userProfiles, topSubreddits) {
    await prisma.searchResult.createMany({
        data: [...posts, ...comments].map(item => ({
            username: item.data.author,
            postTitle: item.data.title || 'Comment',
            postContent: item.data.selftext || item.data.body || '',
            subreddit: item.data.subreddit,
            relevanceScore: item.relevanceScore,
            searchId,
            isComment: !item.data.title,
        })),
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

export async function calculateSubredditRelevance(subreddit, productIdea, keywords, rules, wiki, keywordStats, sentiment) {
    // Implement relevance calculation logic here
    // This function should return a relevance score between 0 and 1
}

export async function analyzeUserProfile(userInfo, userHistory, userMultireddits, productIdea, keywords) {
    // Implement user profile analysis logic here
    // This function should return an object with analyzed user data and a relevance score
}