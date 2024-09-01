"use client"
import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Alert } from '@mantine/core';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const Dashboard = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdea, setProductIdea] = useState('');
  const [keywords, setKeywords] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      setError('Failed to fetch projects');
    }
  };

  const handleCreateProject = async () => {
    try {
      const response = await axios.post('/api/projects', { name: projectName });
      setSuccess('Project created successfully');
      setProjectName('');
      fetchProjects();
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating project');
    }
  };

  const handleAddToSearchQueue = async () => {
    try {
      if (!selectedProjectId) {
        setError('Please select a project first');
        return;
      }
      const response = await axios.post('/api/searches', { 
        productIdea, 
        keywords: keywords.split(',').map(k => k.trim()),
        projectId: selectedProjectId
      });
      setSuccess('Search added to queue successfully');
      setIsModalOpen(false);
      setProductIdea('');
      setKeywords('');
    } catch (error) {
      setError(error.response?.data?.error || 'Error adding to search queue');
    }
  };

  if (!session) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {error && <Alert color="red" className="mb-4">{error}</Alert>}
      {success && <Alert color="green" className="mb-4">{success}</Alert>}
      
      <div className="mb-4">
        <Input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleCreateProject}>Create Project</Button>
      </div>
      
      <div className="mb-4">
        <select 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="mb-2 p-2 border rounded"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      
      <Button onClick={() => setIsModalOpen(true)}>Add to Search Queue</Button>
      
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Search Queue">
        <Input
          placeholder="Product Idea"
          value={productIdea}
          onChange={(e) => setProductIdea(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Keywords (comma-separated)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddToSearchQueue}>Add to Queue</Button>
      </Modal>
    </div>
  );
};

export default Dashboard;