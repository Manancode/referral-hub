"use client";
import { useState } from "react";

interface SearchFormProps {
  projectId?: any; // Add projectId to the props
  onSubmit?: (data: { productIdea: string; keywords: string[] }) => void;
}

export default function SearchForm({ projectId, onSubmit }: SearchFormProps) {
  const [productIdea, setProductIdea] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      productIdea,
      keywords: keywords.split(',').map(k => k.trim()),
      projectId, // Include projectId if needed
    };

    if (typeof onSubmit === 'function') {
      onSubmit(data);
    } else {
      try {
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
        console.log('Search submitted:', responseData);
      } catch (error) {
        console.error('Error submitting search:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Product Idea" 
        value={productIdea} 
        onChange={(e) => setProductIdea(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Keywords (comma separated)" 
        value={keywords} 
        onChange={(e) => setKeywords(e.target.value)} 
        required 
      />
      <button type="submit">Find Potential Customers</button>
    </form>
  );
}
