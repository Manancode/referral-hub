import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { searchPosts, getSubredditInfo, searchSubreddits } from '@/app/lib/redditApi';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { productIdea, keywords } = await request.json();

    // Automatically fetch the most recent or active project for the user
    const project = await prisma.project.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }, // Get the most recently updated project
      select: { id: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'No projects found for this user' }, { status: 404 });
    }

    // Search for relevant subreddits
    const subreddits = await searchSubreddits(productIdea);

    // Create the search record in the database
    const search = await prisma.search.create({
      data: {
        keywords,
        subreddits: subreddits.data.children.map((subreddit) => subreddit.data.display_name),
        project: {
          connect: { id: project.id }
        },
        user: {
          connect: { id: userId }
        },
      },
    });

    // Search for posts across multiple subreddits
    let allPosts = [];
    for (const subreddit of subreddits.data.children.slice(0, 5)) {
      const subredditName = subreddit.data.display_name;
      for (const keyword of keywords) {
        const posts = await searchPosts(`${productIdea} ${keyword}`, subredditName);
        allPosts = allPosts.concat(posts.data.children);
      }
    }

    // Save each post as a search result in the database
    const searchResults = await prisma.searchResult.createMany({
      data: allPosts.map((post) => ({
        username: post.data.author,
        postTitle: post.data.title,
        postContent: post.data.selftext || '',
        subreddit: post.data.subreddit,
        relevanceScore: calculateRelevanceScore(post, keywords),
        searchId: search.id,
      })),
    });

    return NextResponse.json({
      search,
      searchResults,
      relevantSubreddits: subreddits.data.children.map(s => s.data.display_name)
    });
  } catch (error) {
    console.error('Error fetching or saving data:', error);
    return NextResponse.json({ error: 'Failed to fetch or save data' }, { status: 500 });
  }
}


function calculateRelevanceScore(post, keywords) {
  let score = 0;
  keywords.forEach(keyword => {
    if (post.data.title.toLowerCase().includes(keyword.toLowerCase()) || 
        post.data.selftext.toLowerCase().includes(keyword.toLowerCase())) {
      score += 1;
    }
  });
  return score / keywords.length;
}