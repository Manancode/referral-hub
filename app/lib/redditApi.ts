import axios from 'axios';

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

const makeRequest = async (url: string, params: any = {}) => {
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
  

  
export const searchPosts = async (query: string, subreddit?: string  , after?: string ) => {
  const endpoint = subreddit 
    ? `/r/${subreddit}/search`
    : '/search';
  
    return makeRequest(`${BASE_URL}${endpoint}`, { q: query, limit: 100, sort: 'new', after });
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

export const searchSubreddits = async (query: string) => {
  return makeRequest(`${BASE_URL}/subreddits/search`, { q: query, limit: 100 });
};

// Function to handle content deletion
export const handleContentDeletion = async (contentType: 'post' | 'comment' | 'user', id: string) => {
  // Implement logic to remove deleted content from your database
  console.log(`Deleting ${contentType} with ID: ${id}`);
  // Your deletion logic here
};