import { PrismaClient } from '@prisma/client';
import { generateWithGPT } from './openaiconfig';

const prisma = new PrismaClient();

export async function generateUserOutreachStrategies(searchId) {
    const search = await prisma.search.findUnique({
        where: { id: searchId },
        include: {
            userProfiles: true,
            searchResults: true,
        },
    });

    if (!search) {
        throw new Error(`Search with id ${searchId} not found`);
    }

    const { userProfiles, searchResults, keywords } = search;

    const outreachStrategies = await Promise.all(
        userProfiles.map(async (user) => {
            const userPosts = searchResults.filter(result => result.username === user.username);
            
            const prompt = `Create an outreach strategy for Reddit user ${user.username} who is interested in ${keywords.join(', ')}. 
            Consider their recent posts and comments: ${userPosts.map(post => post.postTitle || post.postContent.substring(0, 50)).join('; ')}. 
            Suggest a personalized approach to engage with this user on Reddit, potentially leading to a business opportunity. 
            Include: 
            1. A brief user profile
            2. Suggested subreddits to engage with them
            3. Topics of interest based on their activity
            4. A tailored conversation starter
            5. Long-term engagement strategy
            Ensure the approach is subtle, value-adding, and not overtly promotional.`;

            const strategy = await generateWithGPT(prompt, 400);

            return {
                username: user.username,
                relevanceScore: user.relevanceScore,
                outreachStrategy: strategy,
            };
        })
    );

    await saveOutreachStrategies(searchId, outreachStrategies);

    return outreachStrategies;
}

async function saveOutreachStrategies(searchId, strategies) {
    await prisma.outreachStrategy.createMany({
        data: strategies.map(strategy => ({
            username: strategy.username,
            relevanceScore: strategy.relevanceScore,
            strategy: strategy.outreachStrategy,
            searchId,
        })),
    });
}

export async function getUserOutreachStrategies(searchId) {
    return await prisma.outreachStrategy.findMany({
        where: { searchId },
        orderBy: { relevanceScore: 'desc' },
    });
}