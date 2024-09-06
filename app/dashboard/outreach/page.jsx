"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@mantine/core';
import { Select , SelectTrigger, SelectValue, SelectContent, SelectItem} from '@mantine/core';
import { Textarea } from "@/components/ui/textarea"
import useToast from '@/components/ui/toaster'

export default function Outreach() {
  const toast = useToast()
  const [outreachStrategies, setOutreachStrategies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    // Fetch outreach strategies and templates when component mounts
    fetchOutreachStrategies();
    fetchMessageTemplates();
  }, []);

  const fetchOutreachStrategies = async () => {
    try {
      const response = await fetch('/api/outreach');
      if (!response.ok) throw new Error('Failed to fetch outreach strategies');
      const data = await response.json();
      setOutreachStrategies(data);
    } catch (error) {
      console.error('Error fetching outreach strategies:', error);
      toast({
        title: "Error",
        description: "Failed to load outreach strategies",
        variant: "destructive",
      });
    }
  };

  const fetchMessageTemplates = async () => {
    try {
      const response = await fetch('/api/message-templates');
      if (!response.ok) throw new Error('Failed to fetch message templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching message templates:', error);
      toast({
        title: "Error",
        description: "Failed to load message templates",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUsername: selectedStrategy.username,
          templateId: selectedTemplate,
          customFields: { customMessage },
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {outreachStrategies.map((strategy) => (
          <Card key={strategy.id} className="bg-background border-input shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={strategy.username} />
                  <AvatarFallback>{strategy.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{strategy.username}</div>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${strategy.relevanceScore > 0.7 ? 'bg-green-500 text-green-50' : 
                    strategy.relevanceScore > 0.4 ? 'bg-yellow-500 text-yellow-50' : 
                    'bg-red-500 text-red-50'} 
                  font-medium px-2 py-1 rounded-md
                `}
              >
                {strategy.relevanceScore > 0.7 ? 'High' : strategy.relevanceScore > 0.4 ? 'Medium' : 'Low'}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{strategy.strategy}</p>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" onClick={() => setSelectedStrategy(strategy)}>
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message to {strategy.username}</DialogTitle>
                    <DialogDescription>Customize your message and send it to the user.</DialogDescription>
                  </DialogHeader>
                  <Select onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea 
                    placeholder="Add a custom message..." 
                    value={customMessage} 
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={handleSendMessage}>Send Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}