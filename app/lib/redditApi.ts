  import axios from 'axios';
  import { PrismaClient } from '@prisma/client';
  import { RateLimiter } from 'limiter';

  const prisma = new PrismaClient();

  const BASE_URL = 'https://oauth.reddit.com';
  const AUTH_URL = 'https://www.reddit.com/api/v1/access_token';

  let accessToken: string | null = null;
  let tokenExpiration: number = 0;

  const CLIENT_ID = '1jPZ_TJH9cRyZdUolJCNDw';
  const CLIENT_SECRET = 'Je3TlAXBXcTrxcNUEHI34ok9tJjWVg';
  const REDDIT_USERNAME = 'Away_Expression_3713';
  const APP_ID = '1jPZ_TJH9cRyZdUolJCNDw';
  const VERSION = 'v1.0.0';

  const USER_AGENT = `web:${APP_ID}:${VERSION} (by /u/${REDDIT_USERNAME})`;

  const getAccessToken = async () => {
      const now = Date.now();
      if (accessToken && now < tokenExpiration) {
          return accessToken;
      }

      try {
          const response = await axios.post(
              AUTH_URL,
              new URLSearchParams({
                  grant_type: 'password',
                  username: 'Away_Expression_3713',  
                  password: 'Manan26arora',  
              }).toString(),  
              {
                  auth: {
                      username: CLIENT_ID,
                      password: CLIENT_SECRET,
                  },
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'User-Agent': USER_AGENT,
                  },
              }
          );

          accessToken = response.data.access_token;
          tokenExpiration = now + response.data.expires_in * 1000;
          return accessToken;
      } catch (error) {
          console.error('Error fetching access token:', error);
          throw error;
      }
  };

  const getHeaders = async () => ({
    'Authorization': `bearer ${await getAccessToken()}`,
    'User-Agent': USER_AGENT
  });

  const limiter = new RateLimiter({ tokensPerInterval: 60, interval: 'minute' });

  const makeRequest = async (url: string, params: any = {}) => {
    await limiter.removeTokens(1);
      try {
        const headers = await getHeaders();
        const response = await axios.get(url, { headers, params });

        console.log('Rate Limit Info:');
        console.log(`Used: ${response.headers['x-ratelimit-used']}`);
        console.log(`Remaining: ${response.headers['x-ratelimit-remaining']}`);
        console.log(`Reset: ${response.headers['x-ratelimit-reset']}`);

        return response.data;
      } catch (error) {
        console.error(`Error making request to ${url}:`, error);
        throw error;
      }
    };

  export const searchPosts = async (query: string, subreddit?: string, after?: string, userTier: 'free' | 'basic' | 'premium' = 'free') => {
    const endpoint = subreddit 
      ? `/r/${subreddit}/search`
      : '/search';

    const tierLimits = { free: 50, basic: 500, premium: 2000 };
    const limit = tierLimits[userTier];

    const params = {
      q: query,
      limit: 100,
      sort: 'relevance',
      type: 'link',
      after: after || undefined 
    };

    let allPosts: any[] = [];
    let currentAfter = after;

    while (allPosts.length < limit) {
      const response = await makeRequest(`${BASE_URL}${endpoint}`, { ...params, after: currentAfter });
      allPosts = allPosts.concat(response.data.children);
      currentAfter = response.data.after;
      if (!currentAfter) break;
    }

    return allPosts.slice(0, limit);
  };

  export const getSubredditInfo = async (subreddit: string) => {
    return makeRequest(`${BASE_URL}/r/${subreddit}/about`);
  };

  export const getHotPosts = async (subreddit: string) => {
    return makeRequest(`${BASE_URL}/r/${subreddit}/hot`, { limit: 100 });
  };

  export const getPostComments = async (postId: string, subreddit: string) => {
    const response = await makeRequest(`${BASE_URL}/r/${subreddit}/comments/${postId}`);
    return response[1].data.children;
  };

  export const getUserInfo = async (username: string) => {
    return makeRequest(`${BASE_URL}/user/${username}/about`);
  };

  export const getUserPosts = async (username: string) => {
    return makeRequest(`${BASE_URL}/user/${username}/submitted`, { limit: 100 });
  };

  export const getUserComments = async (username: string) => {
    return makeRequest(`${BASE_URL}/user/${username}/comments`, { limit: 100 });
  };

  export const searchSubreddits = async (query: string) => {
    return makeRequest(`${BASE_URL}/subreddits/search`, { q: query, limit: 100 });
  };

  export const getUserHistory = async (username: string) => {
    const posts = await getUserPosts(username);
    const comments = await getUserComments(username);
    return { posts, comments };
  };

  export const handleContentDeletion = async (contentType: 'post' | 'comment' | 'user', id: string) => {
    try {
      switch (contentType) {
        case 'post':
          await prisma.searchResult.update({
            where: { id },
            data: { isDeleted: true }
          });
          console.log(`Marked post with ID ${id} as deleted`);
          break;
        case 'user':
          await prisma.userResult.update({
            where: { id },
            data: { isDeleted: true }
          });
          console.log(`Marked user with ID ${id} as deleted`);
          break;
        case 'comment':
          // If you decide to add comments to your schema in the future
          console.log(`Comment deletion not implemented for ID ${id}`);
          break;
        default:
          console.log(`Unknown content type: ${contentType}`);
      }
    } catch (error) {
      console.error(`Error marking ${contentType} with ID ${id} as deleted:`, error);
      throw error;
    }
  };

  export const updateDeletedContent = async () => {
    try {
      const posts = await prisma.searchResult.findMany({
        where: { isDeleted: false },
        take: 100 // Limit the number of posts to check at once
      });

      for (const post of posts) {
        try {
          await makeRequest(`${BASE_URL}/r/${post.subreddit}/comments/${post.id}`);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 404) {
              await handleContentDeletion('post', post.id);
            }
          } else {
            console.error('Unexpected error:', error);
          }
        }
      }

      const users = await prisma.userResult.findMany({
        where: { isDeleted: false },
        take: 100 // Limit the number of users to check at once
      });

      for (const user of users) {
        try {
          await getUserInfo(user.username); 
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 404) {
              await handleContentDeletion('user', user.id);
            }
          } else {
            console.error('Unexpected error:', error);
          }
        }
      }

      console.log('Finished updating deleted content');
    } catch (error) {
      console.error('Error updating deleted content:', error);
    }
  };


  export const getSubredditRules = async (subreddit: string) => {
  return makeRequest(`${BASE_URL}/r/${subreddit}/about/rules`);
};

export const getSubredditWiki = async (subreddit: string, page: string = 'index') => {
  return makeRequest(`${BASE_URL}/r/${subreddit}/wiki/${page}`);
};

export const getSubredditModerators = async (subreddit: string) => {
  return makeRequest(`${BASE_URL}/r/${subreddit}/about/moderators`);
};

export const getUserMultireddits = async (username: string) => {
  return makeRequest(`${BASE_URL}/api/multi/user/${username}`);
};

export const getSubredditTopContributors = async (subreddit: string) => {
  return makeRequest(`${BASE_URL}/r/${subreddit}/about/contributors`);
};

export const searchPostsAdvanced = async (query: string, params: {
  subreddit?: string,
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments',
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all',
  limit?: number,
  after?: string
}) => {
  const endpoint = params.subreddit ? `/r/${params.subreddit}/search` : '/search';
  return makeRequest(`${BASE_URL}${endpoint}`, {
    q: query,
    sort: params.sort || 'relevance',
    t: params.time,
    limit: params.limit || 100,
    after: params.after,
    type: 'link'
  });
};

export const getSubredditKeywordStats = async (subreddit: string, keywords: any[]) => {
  const posts = await getHotPosts(subreddit);
  const stats = keywords.reduce((acc, keyword) => ({ ...acc, [keyword]: 0 }), {});

  posts.data.children.forEach((post: { data: { title: string; selftext: string; }; }) => {
    keywords.forEach(keyword => {
      if (post.data.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.data.selftext.toLowerCase().includes(keyword.toLowerCase())) {
        stats[keyword]++;
      }
    });
  });

  return stats;
};

export const analyzeUserEngagement = async (username: string) => {
  const history = await getUserHistory(username);
  const karma = await makeRequest(`${BASE_URL}/api/v1/me/karma`);

  const totalPosts = history.posts.length;
  const totalComments = history.comments.length;
  const avgPostScore = history.posts.reduce((sum: any, post: { data: { score: any; }; }) => sum + post.data.score, 0) / totalPosts;
  const avgCommentScore = history.comments.reduce((sum: any, comment: { data: { score: any; }; }) => sum + comment.data.score, 0) / totalComments;

  return {
    username,
    totalPosts,
    totalComments,
    avgPostScore,
    avgCommentScore,
    karmaBreakdown: karma.data
  };
};

export const getSubredditSentiment = async (subreddit: string, sampleSize: number = 100) => {
  const posts = await makeRequest(`${BASE_URL}/r/${subreddit}/hot`, { limit: sampleSize });
  // Implement sentiment analysis here (you may want to use a third-party library)
  // This is a placeholder implementation
  const sentimentScore = posts.data.children.reduce((sum: number, post: { data: { score: number; }; }) => {
    // Simplified sentiment calculation (replace with actual sentiment analysis)
    const score = post.data.score > 0 ? 1 : -1;
    return sum + score;
  }, 0) / sampleSize;

  return {
    subreddit,
    sentimentScore,
    sampleSize
  };
};

export const findRelatedSubreddits = async (subreddit: string) => {
  const info = await getSubredditInfo(subreddit);
  const relatedSubreddits = info.data.advertiser_category?.split(',') || [];
  const results = await Promise.all(relatedSubreddits.map(async (relatedSub: string) => {
    const subInfo = await getSubredditInfo(relatedSub.trim());
    return {
      name: relatedSub.trim(),
      subscribers: subInfo.data.subscribers,
      publicDescription: subInfo.data.public_description
    };
  }));
  return results.sort((a, b) => b.subscribers - a.subscribers);
};


export const postToReddit = async (suggestion: any) => {
  const token = await getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const data = new URLSearchParams({
    api_type: 'json',
    kind: 'self',
    sr: suggestion.search.subreddit,
    title: suggestion.title,
    text: suggestion.content,
  });

  try {
    const response = await axios.post(
      `${BASE_URL}/api/submit`,
      data,
      { headers }
    );

    if (response.data.json.errors && response.data.json.errors.length > 0) {
      throw new Error(response.data.json.errors[0][1]);
    }

    return response.data.json.data;
  } catch (error) {
    console.error('Error posting to Reddit:', error);
    throw error;
  }
};