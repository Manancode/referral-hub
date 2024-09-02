import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model;

export async function loadModel() {
  if (!model) {
    model = await use.load();
  }
  return model;
}

export async function calculateIntegratedRelevanceScore(post, keywords, productIdea) {
    console.log(`Calculating integrated relevance score for post ${post.data.id}`);
    
    const scores = {
      contentRelevance: 0,
      subredditRelevance: 0,
      userProfileRelevance: 0,
      historicalRelevance: 0,
      engagementScore: 0
    };
  
    // Content Relevance
    const content = (post.data.title + ' ' + post.data.selftext).toLowerCase();
    const similarity = await calculateSemanticSimilarity(productIdea, content);
    scores.contentRelevance += similarity * 2;
  
    if (content.includes(productIdea.toLowerCase())) {
      scores.contentRelevance += 2;
    }
  
    const wordCount = content.split(' ').length;
    keywords.forEach(keyword => {
      const keywordCount = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      scores.contentRelevance += (keywordCount / wordCount) * 10;
    });
  
    if (post.data.title.toLowerCase().includes(productIdea.toLowerCase())) {
      scores.contentRelevance += 3;
    }
  
    keywords.forEach(keyword => {
      if (post.data.title.toLowerCase().includes(keyword.toLowerCase())) {
        scores.contentRelevance += 1;
      }
    });
  
    // Subreddit Relevance
    const subreddit = await redditApiRequest(getSubredditInfo, post.data.subreddit);
    scores.subredditRelevance = await calculateSubredditRelevance(subreddit, productIdea, keywords);
  
    // User Profile Relevance
    const userProfileAnalysis = await analyzeUserProfile(post.data.author);
    scores.userProfileRelevance = userProfileAnalysis.relevanceScore;
  
    // Historical Relevance
    const userHistory = await redditApiRequest(getUserHistory, post.data.author);
    scores.historicalRelevance = await analyzeHistoricalData(userHistory, keywords, productIdea);
  
    // Engagement Score
    scores.engagementScore = await calculateEngagementScore(post);
  
    // Calculate overall score
    const overallScore = (
      scores.contentRelevance * 0.3 +
      scores.subredditRelevance * 0.2 +
      scores.userProfileRelevance * 0.15 +
      scores.historicalRelevance * 0.15 +
      scores.engagementScore * 0.2
    ) / 5; // Normalize to 0-1 range
  
    return {
      overallScore,
      individualScores: {
        contentRelevance: Math.min(scores.contentRelevance / 20, 1), // Normalize each score
        subredditRelevance: scores.subredditRelevance,
        userProfileRelevance: scores.userProfileRelevance,
        historicalRelevance: scores.historicalRelevance,
        engagementScore: scores.engagementScore
      }
    };
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

  export async function calculateSemanticSimilarity(text1, text2) {
    const model = await loadModel();
    const embeddings = await model.embed([text1, text2]);
    const similarity = tf.matMul(embeddings, embeddings.transpose()).dataSync()[1];
    return similarity;
  }