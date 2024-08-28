import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { searchPosts, getPostComments } from '@/app/lib/redditApi';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import axios from 'axios';

const prisma = new PrismaClient();

let model;
async function loadModel() {
  if (!model) {
    console.log("Loading TensorFlow model...");
    model = await use.load();
    console.log("TensorFlow model loaded successfully.");
  }
  return model;
}

async function calculateSemanticSimilarity(text1, text2) {
  const embeddings = await model.embed([text1, text2]);
  const similarity = tf.matMul(embeddings, embeddings.transpose()).dataSync()[1];
  return similarity;
}

async function makeRequestWithRetry(apiFunction, ...args) {
  const maxRetries = 3;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await apiFunction(...args);
    } catch (error) {
      console.error(`API request failed (attempt ${retries + 1}/${maxRetries}):`, error.message);
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
}

export async function POST(request) {
  try {
    await loadModel();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { productIdea, keywords } = await request.json();

    console.log(`Processing search for product idea: "${productIdea}" with keywords: ${keywords.join(', ')}`);

    const project = await prisma.project.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'No projects found for this user' }, { status: 404 });
    }

    const search = await prisma.search.create({
      data: {
        keywords,
        project: { connect: { id: project.id } },
        user: { connect: { id: userId } },
      },
    });
    console.log("Search record created:", search.id);

    console.log("Searching posts...");
    let allPosts = [];
    let after = null;
    const startTime = Date.now();
    const TIMEOUT = 30000; // 30 seconds timeout

    do {
      if (!canMakeRequest()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const posts = await makeRequestWithRetry(searchPosts, `${productIdea} ${keywords.join(' ')}`, null, after);
      console.log(`Found ${posts.data.children.length} posts in this batch`);
      allPosts = allPosts.concat(posts.data.children);
      console.log(`Total posts found so far: ${allPosts.length}`);
      after = posts.data.after;

      if (Date.now() - startTime > TIMEOUT) {
        console.log("Search timeout reached. Stopping search.");
        break;
      }
    } while (after && allPosts.length < 100); // Reduced from 1000 to 100

    console.log(`Search completed. Total posts found: ${allPosts.length}`);

    const MIN_RELEVANCE_SCORE = 0.3;
    const relevantPosts = await Promise.all(allPosts.map(async post => {
      const score = await calculateRelevanceScore(post, keywords, productIdea);
      return { ...post, relevanceScore: score };
    }));
    const filteredPosts = relevantPosts.filter(post => post.relevanceScore >= MIN_RELEVANCE_SCORE);
    console.log(`Filtered to ${filteredPosts.length} relevant posts`);

    let users = new Set();
    for (const post of filteredPosts) {
      users.add(post.data.author);
      const comments = await makeRequestWithRetry(getPostComments, post.data.id, post.data.subreddit);
      comments.forEach(comment => users.add(comment.data.author));
    }

    console.log(`Found ${users.size} unique users`);

    const searchResults = await prisma.searchResult.createMany({
      data: filteredPosts.map((post) => ({
        username: post.data.author,
        postTitle: post.data.title,
        postContent: post.data.selftext || '',
        subreddit: post.data.subreddit,
        relevanceScore: post.relevanceScore,
        searchId: search.id,
      })),
    });
    console.log("Search results saved:", searchResults.count);

    const userResults = await prisma.userResult.createMany({
      data: Array.from(users).map(username => ({
        username,
        searchId: search.id,
      })),
    });
    console.log("User results saved:", userResults.count);

    return NextResponse.json({
      search,
      searchResults: searchResults.count,
      userResults: userResults.count,
      samplePosts: filteredPosts.slice(0, 10).map(post => ({
        title: post.data.title,
        author: post.data.author,
        relevanceScore: post.relevanceScore
      }))
    });
  } catch (error) {
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Failed to fetch or save data', details: error.message }, { status: 500 });
  }
}

async function calculateRelevanceScore(post, keywords, productIdea) {
  let score = 0;
  const content = (post.data.title + ' ' + post.data.selftext).toLowerCase();
  const productWords = productIdea.toLowerCase().split(' ');

  const similarity = await calculateSemanticSimilarity(productIdea, content);
  score += similarity * 2;

  if (content.includes(productIdea.toLowerCase())) {
    score += 2;
  }

  productWords.forEach(word => {
    if (content.includes(word)) {
      score += 0.5;
    }
  });

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    if (content.includes(keywordLower)) {
      score += 1;
    }
    if (post.data.title.toLowerCase().includes(keywordLower)) {
      score += 0.5;
    }
  }

  const normalizedScore = score / Math.log(content.length + 1);
  const upvoteRatio = post.data.upvote_ratio || 0.5;
  const commentScore = Math.log(post.data.num_comments + 1);

  const finalScore = (normalizedScore * 0.6) + (upvoteRatio * 0.2) + (commentScore * 0.2);

  return Math.min(finalScore, 1);
}

const rateLimiter = {
  maxTokens: 50,
  tokens: 50,
  refillRate: 10,
  lastRefill: Date.now(),
  backoffTime: 1000,
};

function canMakeRequest() {
  const now = Date.now();
  const tokensToAdd = Math.floor((now - rateLimiter.lastRefill) / 1000) * rateLimiter.refillRate;
  rateLimiter.tokens = Math.min(rateLimiter.maxTokens, rateLimiter.tokens + tokensToAdd);
  rateLimiter.lastRefill = now;

  if (rateLimiter.tokens > 0) {
    rateLimiter.tokens--;
    rateLimiter.backoffTime = 1000;
    return true;
  }

  console.log(`Rate limit reached. Backing off for ${rateLimiter.backoffTime}ms`);
  setTimeout(() => {
    rateLimiter.backoffTime *= 2;
  }, rateLimiter.backoffTime);

  return false;
} 