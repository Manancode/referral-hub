"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from "lucide-react";

export default function ContentManagement() {
  const [suggestions, setSuggestions] = useState({ posts: [], replies: [], engagements: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {toast} = Toaster()

  const fetchSuggestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching suggestions...');
      const response = await fetch('/api/generate-suggesstions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch suggestions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Suggestions received:', data);

      setSuggestions({
        posts: data.postSuggestions,
        replies: data.replySuggestions,
        engagements: data.engagementSuggestions,
      });
    } catch (err) {
      console.error('Error in fetchSuggestions:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleAction = async (suggestion, type, action) => {
    try {
      const response = await fetch('/api/content-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion, type, action }),
      });
  
      if (!response.ok) throw new Error(`Failed to ${action} ${type}`);
  
      const data = await response.json();
  
      toast({
        title: "Success",
        description: data.message,
      });
  
      // Update the local state with the new suggestion data
      setSuggestions(prev => ({
        ...prev,
        [type + 's']: prev[type + 's'].map(s => 
          s.id === data.suggestion.id ? data.suggestion : s
        )
      }));
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleApprove = (suggestion, type) => handleAction(suggestion, type, 'approve');
  const handleReject = (suggestion, type) => handleAction(suggestion, type, 'reject');

  const renderTable = (type, data) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Suggested Content</TableHead>
            <TableHead className="w-1/4">Target</TableHead>
            <TableHead className="text-right w-1/4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((suggestion) => (
            <TableRow key={suggestion.id}>
              <TableCell>{suggestion.content}</TableCell>
              <TableCell>{suggestion.targetSubreddit || suggestion.targetPostId || suggestion.targetUsername}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleApprove(suggestion, type)}>
                  Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleReject(suggestion, type)}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        <span className="text-2xl font-semibold">Loading suggestions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-xl">{error}</p>
          <Button className="mt-4" onClick={fetchSuggestions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-background border-b px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Content Management</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="w-full sm:w-auto">Export</Button>
          <Button className="w-full sm:w-auto" onClick={fetchSuggestions}>Refresh Suggestions</Button>
        </div>
      </header>
      <div className="flex-1 p-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="border-b w-full flex-wrap">
            <TabsTrigger value="posts" className="flex-grow">Posts ({suggestions.posts.length})</TabsTrigger>
            <TabsTrigger value="replies" className="flex-grow">Replies ({suggestions.replies.length})</TabsTrigger>
            <TabsTrigger value="engagements" className="flex-grow">Engagements ({suggestions.engagements.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="pt-4">
            {renderTable('post', suggestions.posts)}
          </TabsContent>
          <TabsContent value="replies" className="pt-4">
            {renderTable('reply', suggestions.replies)}
          </TabsContent>
          <TabsContent value="engagements" className="pt-4">
            {renderTable('engagement', suggestions.engagements)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}