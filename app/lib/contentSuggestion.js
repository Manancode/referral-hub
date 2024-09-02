import { PrismaClient } from '@prisma/client';
import { generateWithGPT } from './openaiconfig'

const prisma = new PrismaClient();

export async function generateContentSuggestions(searchId) {
    const search = await prisma.search.findUnique({
        where: { id: searchId },
        include: {
            searchResults: true,
            userProfiles: true,
            subredditAnalyses: true,
        },
    });

    if (!search) {
        throw new Error(`Search with id ${searchId} not found`);
    }

    const { searchResults, userProfiles, subredditAnalyses } = search;

    const postSuggestions = await generatePostSuggestions(subredditAnalyses, searchResults, search.keywords);
    const replySuggestions = await generateReplySuggestions(searchResults, search.keywords);
    const engagementSuggestions = await generateEngagementSuggestions(userProfiles, searchResults, search.keywords);

    await saveContentSuggestions(searchId, postSuggestions, replySuggestions, engagementSuggestions);

    return {
        postSuggestions,
        replySuggestions,
        engagementSuggestions,
    };
}

async function generatePostSuggestions(subredditAnalyses, searchResults, keywords) {
    const suggestions = [];
    for (const subreddit of subredditAnalyses) {
        const rules = JSON.parse(subreddit.rules);
        const topPosts = searchResults.filter(result => result.subreddit === subreddit.name)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 5);

        const prompt = `Generate a Reddit post for the subreddit r/${subreddit.name} about ${keywords.join(', ')}. 
        The post should follow these rules: ${rules.join(', ')}. 
        It should be similar in style to these top posts: ${topPosts.map(post => post.postTitle).join(', ')}. 
        The post should subtly mention a product or service without direct self-promotion.`;

        const content = await generateWithGPT(prompt, 250);
        suggestions.push({
            content,
            targetSubreddit: subreddit.name,
        });
    }
    return suggestions;
}

async function generateReplySuggestions(searchResults, keywords) {
    const suggestions = [];
    const topPosts = searchResults
        .filter(result => !result.isComment)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);

    for (const post of topPosts) {
        const prompt = `Generate a thoughtful and engaging reply to this Reddit post: "${post.postTitle}". 
        The reply should relate to ${keywords.join(', ')} and add value to the discussion without direct self-promotion. 
        It should be informative and potentially mention a solution or product indirectly.`;

        const content = await generateWithGPT(prompt, 150);
        suggestions.push({
            content,
            targetPostId: post.id,
        });
    }
    return suggestions;
}

async function generateEngagementSuggestions(userProfiles, searchResults, keywords) {
    const suggestions = [];
    const topUsers = userProfiles
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);

    for (const user of topUsers) {
        const userPosts = searchResults.filter(result => result.username === user.username);
        const prompt = `Create a personalized engagement strategy for Reddit user ${user.username} who is interested in ${keywords.join(', ')}. 
        Consider their recent posts: ${userPosts.map(post => post.postTitle).join(', ')}. 
        Suggest ways to meaningfully interact with this user, potentially leading to a business opportunity without being pushy or promotional.`;

        const content = await generateWithGPT(prompt, 200);
        suggestions.push({
            content,
            targetUsername: user.username,
        });
    }
    return suggestions;
}

async function saveContentSuggestions(searchId, postSuggestions, replySuggestions, engagementSuggestions) {
    await prisma.contentSuggestion.createMany({
        data: [
            ...postSuggestions.map(suggestion => ({
                type: 'post',
                content: suggestion.content,
                targetSubreddit: suggestion.targetSubreddit,
                searchId,
            })),
            ...replySuggestions.map(suggestion => ({
                type: 'reply',
                content: suggestion.content,
                targetPostId: suggestion.targetPostId,
                searchId,
            })),
            ...engagementSuggestions.map(suggestion => ({
                type: 'engagement',
                content: suggestion.content,
                targetUsername: suggestion.targetUsername,
                searchId,
            })),
        ],
    });
}