
export const REDDIT_RATE_LIMIT = {
    requests: 1000,
    period: 600000,
  };  
  
  export const TIER_LIMITS = {
    free: { projects: 1, dailySearches: 1, resultsPerDay: 100 },
    basic: { projects: 2, dailySearches: 5, resultsPerDay: 100 },
    premium: { projects: 3, dailySearches: 10, resultsPerDay: 300 },
  };