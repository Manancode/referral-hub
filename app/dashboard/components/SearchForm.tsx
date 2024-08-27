import React, { useState } from "react";

interface SearchFormProps {
  projectId?: string;
  onSubmit?: (data: { productIdea: string; keywords: string[]; projectId?: string }) => void;
}

interface SearchResult {
  id: string;
  postTitle: string;
  postContent: string;
  username: string;
  subreddit: string;
}

export default function SearchForm({ projectId, onSubmit }: SearchFormProps) {
  const [productIdea, setProductIdea] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      productIdea,
      keywords: keywords.split(',').map(k => k.trim()),
      projectId,
    };

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(data);
      } else {
        const response = await fetch('/api/searches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to submit search');
        }

        const responseData = await response.json();
        console.log('Search results:', responseData);
        setSearchResults(responseData.searchResults || []);
      }
    } catch (error) {
      console.error('Error submitting search:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Product Idea" 
          value={productIdea} 
          onChange={(e) => setProductIdea(e.target.value)} 
          required 
          className="w-full p-2 border rounded"
        />
        <input 
          type="text" 
          placeholder="Keywords (comma separated)" 
          value={keywords} 
          onChange={(e) => setKeywords(e.target.value)} 
          required 
          className="w-full p-2 border rounded"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Searching...' : 'Find Potential Customers'}
        </button>
      </form>
      
      {searchResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Search Results:</h2>
          <ul className="space-y-4">
            {searchResults.map((result) => (
              <li key={result.id} className="p-4 bg-white rounded shadow">
                <h3 className="text-lg font-medium">{result.postTitle}</h3>
                <p className="text-sm text-gray-700 mt-2">{result.postContent}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  Posted by {result.username} in {result.subreddit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 