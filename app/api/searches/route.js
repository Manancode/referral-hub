import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { searchPosts, getSubredditInfo, searchSubreddits, getUserInfo, getUserHistory, getPostComments } from '@/app/lib/redditApi';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import Redis from 'ioredis';
import Bull from 'bull';
import { sendEmail } from '@/app/scheduledTasks';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: {},
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return client;
};

const redis = createRedisClient();

const searchQueue = new Bull('search-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: {},
  }
});


// Retry function for API calls
const retryApiCall = async (fn, args, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(...args);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};        

const REDDIT_RATE_LIMIT = {
  requests: 1000,
  period: 600000,
};  

const TIER_LIMITS = {
  free: { projects: 1, dailySearches: 1, resultsPerDay: 100 },
  basic: { projects: 2, dailySearches: 5, resultsPerDay: 100 },
  premium: { projects: 3, dailySearches: 10, resultsPerDay: 300 },
};

async function redditApiRequest(fn, ...args) {
  console.log(`Calling Reddit API: ${fn.name} with args: ${JSON.stringify(args)}`);
  const key = `ratelimit:reddit:${fn.name}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, REDDIT_RATE_LIMIT.period / 1000);
  }
  if (current > REDDIT_RATE_LIMIT.requests) {
    console.log(`Rate limit exceeded for ${fn.name}. Current: ${current}, TTL: ${ttl}`);
    const ttl = await redis.ttl(key);
    throw new Error(`Rate limit exceeded. Please try again in ${ttl} seconds.`);
  }
  console.log(`Reddit API call ${fn.name} completed successfully`);
  return fn(...args);
}

let model;
async function loadModel() {
  console.log('Loading Universal Sentence Encoder model');
  if (!model) {
    model = await use.load();
    console.log('Model loaded successfully');
  }
  return model;
}

async function calculateSemanticSimilarity(text1, text2) {
  console.log('Calculating semantic similarity');
  const embeddings = await model.embed([text1, text2]);
  const similarity = tf.matMul(embeddings, embeddings.transpose()).dataSync()[1];
  console.log(`Semantic similarity: ${similarity}`);
  return similarity;
}

async function calculateRelevanceScore(post, keywords, productIdea) {
  console.log(`Calculating relevance score for post ${post.data.id}`);
  let score = 0;
  const content = (post.data.title + ' ' + post.data.selftext).toLowerCase();
  const productWords = productIdea.toLowerCase().split(' ');

  // Semantic similarity
  const similarity = await calculateSemanticSimilarity(productIdea, content);
  score += similarity * 2;

  // Exact phrase match
  if (content.includes(productIdea.toLowerCase())) {
    score += 2;
    console.log('Exact phrase match found');
  }

  // Keyword density
  const wordCount = content.split(' ').length;
  keywords.forEach(keyword => {
    const keywordCount = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    score += (keywordCount / wordCount) * 10;
  });

  // Title relevance
  const titleLower = post.data.title.toLowerCase();
  if (titleLower.includes(productIdea.toLowerCase())) {
    score += 3;
    console.log('Product idea found in title');
  }
  keywords.forEach(keyword => {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += 1;
      console.log(`Keyword "${keyword}" found in title`);
    }
  });

  // Subreddit relevance
  const relevantSubreddits = ['startups', 'entrepreneur', 'smallbusiness', 'saas' , 'startup' , 'businessideas', productIdea.toLowerCase()];
  if (relevantSubreddits.includes(post.data.subreddit.toLowerCase())) {
    score += 2;
    console.log(`Relevant subreddit: ${post.data.subreddit}`)
  }

  // Post age
  const postAge = (Date.now() / 1000) - post.data.created_utc;
  const ageScore = Math.max(0, 1 - (postAge / (30 * 24 * 60 * 60)));
  score += ageScore * 2;

  // Engagement metrics
  const upvoteRatio = post.data.upvote_ratio || 0.5;
  const commentScore = Math.log(post.data.num_comments + 1);

  // Historical data analysis
  console.log(`Analyzing historical data for user ${post.data.author}`);
  const authorHistory = await redditApiRequest(getUserHistory, post.data.author);
  const historicalRelevance = await analyzeHistoricalData(authorHistory, keywords, productIdea);
  score += historicalRelevance * 2;

  // Engagement tracking
  const engagementScore = await calculateEngagementScore(post);
  score += engagementScore;

  const finalScore = Math.min(score / 25, 1);
  console.log(`Final relevance score for post ${post.data.id}: ${finalScore}`);
  return finalScore;
}

async function calculateSubredditRelevance(subreddit, productIdea, keywords) {
  console.log(`Calculating relevance for subreddit ${subreddit.data.display_name}`)
  const subredditDescription = subreddit.data.public_description || '';
  const similarity = await calculateSemanticSimilarity(productIdea, subredditDescription);
  let score = similarity;

  keywords.forEach(keyword => {
    if (subredditDescription.toLowerCase().includes(keyword.toLowerCase())) {
      score += 0.5;
    }
  });

  return Math.min(score, 1);
}

async function analyzeUserProfile(username) {
  console.log(`Analyzing user profile for ${username}`);
  const userInfo = await redditApiRequest(getUserInfo, username);
  const potentialFounder = userInfo.data.subreddit.display_name_prefixed.includes('founder');
  const relevanceScore = potentialFounder ? 1 : 0.5;
  console.log(`User ${username}: potential founder - ${potentialFounder}, relevance score - ${relevanceScore}`);

  return {
    potentialFounder,
    relevanceScore,
  };
}

async function analyzeHistoricalData(userHistory, keywords, productIdea) {
  console.log(`Analyzing historical data for user`);
  let score = 0;
  const relevantPosts = userHistory.filter(post =>
    post.title.toLowerCase().includes(productIdea.toLowerCase()) ||
    keywords.some(keyword => post.title.toLowerCase().includes(keyword.toLowerCase()))
  );
  score += relevantPosts.length * 0.1; 
  console.log(`Relevant historical posts found: ${relevantPosts.length}`);// Increase score for each relevant historical post
  // Analyze posting frequency
  const postDates = userHistory.map(post => new Date(post.created_utc * 1000));
  const daysSinceFirstPost = (Date.now() - Math.min(...postDates)) / (1000 * 60 * 60 * 24);
  const postsPerDay = userHistory.length / daysSinceFirstPost;
  score += Math.min(postsPerDay, 1);
  console.log(`Posts per day: ${postsPerDay}`); // Cap at 1 to prevent overly active users from skewing the score
  const finalScore = Math.min(score, 1);
  console.log(`Final historical data score: ${finalScore}`);
  return finalScore;
}

async function calculateEngagementScore(post) {
  console.log(`Calculating engagement score for post ${post.data.id}`);
  const comments = await redditApiRequest(getPostComments, post.data.id);
  const commentCount = comments.length;
  const uniqueCommenters = new Set(comments.map(comment => comment.author)).size;
  let score = 0;
  score += Math.min(commentCount / 100, 1); // Cap at 1 for posts with 100+ comments
  score += Math.min(uniqueCommenters / 50, 1); // Cap at 1 for posts with 50+ unique commenters
  score += Math.min(post.data.score / 1000, 1); // Cap at 1 for posts with 1000+ upvotes
  const finalScore = Math.min(score / 3, 1); // Normalize to 0-1 range
  console.log(`Engagement score for post ${post.data.id}: ${finalScore}`);
  return finalScore;
}

async function sendCSVReport(userId, csvData) {
  console.log(`Sending CSV report to user ${userId}`);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await sendEmail(
    user.email,
    'Your Daily Potential Customer Report',
    'Please find attached your daily report of potential customers.',
    '<p>Please find attached your daily report of potential customers.</p>',
    [
      {
        filename: 'potential_customers.csv',
        content: csvData
      }
    ]
  );
  console.log(`CSV report sent to user ${userId}`);
}

async function processSearch(job) {
  
  const { userId = session.userId , productIdea, keywords, tier } = job.data;
  console.log(`Starting search process for user ${userId}, product idea: ${productIdea}, keywords: ${keywords.join(', ')}, tier: ${tier}`);
  try {
    await loadModel();
    console.log('Model loaded successfully');

    const project = await prisma.project.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, userId: true },
    });

    if (!project) {
      console.log(`No projects found for user ${userId}`);
      throw new Error('No projects found for this user');
    }

    console.log(`Project found: ${project.id}`);

    const subreddits = await redditApiRequest(searchSubreddits, productIdea);
    console.log(`Found ${subreddits.data.children.length} subreddits`);
    
    if (subreddits.data.children.length === 0) {
      console.log('No subreddits found. Attempting broader search...');
      const broaderSearch = await redditApiRequest(searchSubreddits, keywords.join(' '));
      subreddits.data.children = broaderSearch.data.children;
      console.log(`Found ${subreddits.data.children.length} subreddits in broader search`);
    }

    const search = await prisma.search.create({
      data: {
        keywords,
        subreddits: subreddits.data.children.map((subreddit) => subreddit.data.display_name),
        project: { connect: { id: project.id } },
        user: { connect: { id: userId } },
      },
    });

    console.log(`Search record created with ID: ${search.id}`);

    const rankedSubreddits = await Promise.all(subreddits.data.children.map(async (subreddit) => {
      const info = await redditApiRequest(getSubredditInfo, subreddit.data.display_name);
      const relevance = await calculateSubredditRelevance(subreddit, productIdea, keywords);
      console.log(`Subreddit ${subreddit.data.display_name}: subscribers - ${info.data.subscribers}, relevance - ${relevance}`);
      return {
        name: subreddit.data.display_name,
        subscribers: info.data.subscribers,
        relevance: relevance
      };
    }));

    rankedSubreddits.sort((a, b) => (b.relevance * Math.log(b.subscribers)) - (a.relevance * Math.log(a.subscribers)));
    const topSubreddits = rankedSubreddits.slice(0, 5);
    console.log(`Top 5 subreddits: ${topSubreddits.map(s => s.name).join(', ')}`);

    let allPosts = [];
    let allComments = [];
    for (const subreddit of topSubreddits) {
      let after = null;
      do {
        const posts = await redditApiRequest(searchPosts, `${productIdea} ${keywords.join(' ')}`, subreddit.name, after);
        allPosts = allPosts.concat(posts.data.children);
        
        // Fetch comments for each post
        for (const post of posts.data.children) {
          const comments = await redditApiRequest(getPostComments, post.data.id);
          allComments = allComments.concat(comments);
        }
        
        after = posts.data.after;
        console.log(`Fetched ${posts.data.children.length} posts and ${comments.length} comments from ${subreddit.name}, total posts: ${allPosts.length}, total comments: ${allComments.length}`);
      } while (after && allPosts.length < TIER_LIMITS[tier]);
    }

    console.log(`Total posts fetched: ${allPosts.length}, Total comments fetched: ${allComments.length}`);
    
    const MIN_RELEVANCE_SCORE = 0.2; // Lowered from 0.3 to potentially capture more results
    
    allPosts = await Promise.all(allPosts.map(async post => {
      const score = await calculateRelevanceScore(post, keywords, productIdea);
      console.log(`Post ${post.data.id} relevance score: ${score}`);
      return { ...post, relevanceScore: score };
    }));
    
    allComments = await Promise.all(allComments.map(async comment => {
      const score = await calculateRelevanceScore(comment, keywords, productIdea);
      console.log(`Comment ${comment.data.id} relevance score: ${score}`);
      return { ...comment, relevanceScore: score };
    }));
    
    allPosts = allPosts.filter(post => post.relevanceScore >= MIN_RELEVANCE_SCORE);
    allComments = allComments.filter(comment => comment.relevanceScore >= MIN_RELEVANCE_SCORE);
    console.log(`Posts after relevance filtering: ${allPosts.length}`);
    console.log(`Comments after relevance filtering: ${allComments.length}`);

    const userProfiles = await Promise.all(
      [...new Set([...allPosts.map(post => post.data.author), ...allComments.map(comment => comment.data.author)])].map(async username => {
        const profile = await analyzeUserProfile(username);
        console.log(`User profile for ${username}: relevance score - ${profile.relevanceScore}`);
        return { username, ...profile };
      })
    );

    // Limit the number of results based on the user's tier
    userProfiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedUserProfiles = userProfiles.slice(0, TIER_LIMITS[tier]);
    console.log(`Limited user profiles: ${limitedUserProfiles.length}`);

    if (allPosts.length > 0 || allComments.length > 0) {
      const searchResults = await prisma.searchResult.createMany({
        data: [...allPosts, ...allComments].slice(0, TIER_LIMITS[tier]).map((item) => ({
          username: item.data.author,
          postTitle: item.data.title || 'Comment',
          postContent: item.data.selftext || item.data.body || '',
          subreddit: item.data.subreddit,
          relevanceScore: item.relevanceScore,
          searchId: search.id,
          isComment: !item.data.title,
        })),
      });
      console.log(`Search results created: ${searchResults.count}`);
    } else {
      console.log('No search results to save');
    }



    console.log(`Search results created: ${searchResults.count}`);

    if (limitedUserProfiles.length > 0) {
      await prisma.userProfile.createMany({
        data: limitedUserProfiles.map(profile => ({
          username: profile.username,
          relevanceScore: profile.relevanceScore,
          searchId: search.id,
        })),
      });
      console.log(`User profiles created: ${limitedUserProfiles.length}`);
    } else {
      console.log('No user profiles to save');
    }

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
    console.log('Search usage updated');



    if (tier !== 'free') {
      const csvFields = ['username', 'relevanceScore', 'postTitle', 'postContent', 'subreddit', 'isComment'];
      const csvData = limitedUserProfiles.map(profile => {
        const relatedItem = [...allPosts, ...allComments].find(item => item.data.author === profile.username);
        return [
          profile.username,
          profile.relevanceScore,
          relatedItem ? (relatedItem.data.title || 'Comment') : '',
          relatedItem ? (relatedItem.data.selftext || relatedItem.data.body || '') : '',
          relatedItem ? relatedItem.data.subreddit : '',
          relatedItem ? !relatedItem.data.title : '',
        ];
      });

      if (csvData.length > 0) {
        const csv = stringify(csvData, { header: true, columns: csvFields });
        await sendCSVReport(userId, csv);
      } else {
        console.log('No data available for CSV generation');
      }
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
    console.error('Error processing search:', error);
    await job.progress(100);
    throw error;
  }
}




export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productIdea, keywords, projectId } = await request.json();

    if (!productIdea || !keywords || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user.subscriptionTier) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
    }

    searchQueue.process(processSearch);
    const job = await searchQueue.add({
      userId: session.user.id,
      productIdea,
      keywords,
      tier: user.subscriptionTier,
    });


     // Create a record in the SearchQueue table
     const searchQueueRecord = await prisma.searchQueue.create({
      data: {
        userId: session.user.id,
        productIdea,
        keywords,
        tier: user.subscriptionTier,
      },
    });
    
    const search = await prisma.search.create({
      data: {
        keywords: keywords,
        subreddits: [], 
        projectId: projectId,
        userId: session.user.id,
        status: 'PENDING',
        jobId: job.id.toString(), // Assuming job.id is a number
        productIdea: productIdea,
      },
    });

    return NextResponse.json({
      message: 'Search request queued',
      jobId: job.id,
      searchId: search.id,
    });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searches = await prisma.search.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(searches);
  } catch (error) {
    console.error('Error fetching searches:', error);
    return NextResponse.json({ error: "Failed to fetch searches" }, { status: 500 });
  }
}