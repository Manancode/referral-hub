import { getSubredditInfo, searchPosts } from '@/app/lib/redditApi';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  const { query, subreddit } = await request.json();

  try {
    const posts = await searchPosts(query, subreddit);
    let subredditInfo = null;
    if (subreddit) {
      subredditInfo = await getSubredditInfo(subreddit);
    }

    return NextResponse.json({ posts, subredditInfo });
  } catch (error) {
    console.error('Error fetching data from Reddit:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}