import fetch from 'node-fetch';

const REDDIT_API_URL = 'https://www.reddit.com/search.json';

export async function searchReddit(keywords, subreddits = []) {
  const query = keywords.join(' OR ');
  const subredditQuery = subreddits.length > 0 ? `subreddit:${subreddits.join(' OR ')}` : '';
  const url = `${REDDIT_API_URL}?q=${encodeURIComponent(query + ' ' + subredditQuery)}&sort=new`;

  const response = await fetch(url);
  const data = await response.json();

  return data.data.children.map((child) => ({
    username: child.data.author,
    subreddit: child.data.subreddit,
    postTitle: child.data.title,
    postContent: child.data.selftext,
    relevanceScore: calculateRelevance(child.data)
  }));
}

function calculateRelevance(postData) {
  // Simple string matching to determine relevance score
  return postData.title.includes('time management') || postData.selftext.includes('time management') ? 'High' : 'Medium';
}

export default { searchReddit };
