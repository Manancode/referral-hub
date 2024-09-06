"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button, Card, Badge, Progress, Modal, TextInput, Select, Alert, Group, Text, ActionIcon } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [searches, setSearches] = useState([]);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isAddToSearchQueueModalOpen, setIsAddToSearchQueueModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [productIdea, setProductIdea] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userTier, setUserTier] = useState('');

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchUserTier();
      fetchSearches();
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

  const fetchSearches = async () => {
    try {
      const response = await axios.get('/api/searches');
      setSearches(response.data);
    } catch (error) {
      setError('Failed to fetch searches');
    }
  };

  const fetchUserTier = async () => {
    try {
      const response = await axios.get('/api/user-tier');
      setUserTier(response.data.tier);
    } catch (error) {
      setError('Failed to fetch user tier');
    }
  };

  const handleCreateProject = async () => {
    try {
      if (userTier === 'free' && projects.length >= 1) {
        setError('Free accounts are limited to 1 project');
        return;
      }
      if (userTier === 'basic' && projects.length >= 2) {
        setError('Basic accounts are limited to 2 projects');
        return;
      }
      if (userTier === 'premium' && projects.length >= 3) {
        setError('Premium accounts are limited to 3 projects');
        return;
      }

      const response = await axios.post('/api/projects', { name: newProjectName });
      setSuccess('Project created successfully');
      setNewProjectName('');
      setIsCreateProjectModalOpen(false);
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
      setIsAddToSearchQueueModalOpen(false);
      setProductIdea('');
      setKeywords('');
      fetchSearches();
    } catch (error) {
      setError(error.response?.data?.error || 'Error adding to search queue');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      setSuccess('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  if (!session) {
    return <Text>Please sign in to access the dashboard.</Text>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {error && <Alert color="red" title="Error">{error}</Alert>}
      {success && <Alert color="green" title="Success">{success}</Alert>}
      
      <section style={{ marginBottom: '2rem' }}>
        <Group position="apart" style={{ marginBottom: '1rem' }}>
          <Text size="xl" weight={700}>Projects</Text>
          <Button onClick={() => setIsCreateProjectModalOpen(true)}>Create Project</Button>
        </Group>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {projects.map(project => (
            <Card key={project.id} shadow="sm" padding="lg">
              <Group position="apart" style={{ marginBottom: 5 }}>
                <Text weight={500}>{project.name}</Text>
                <Badge color={project.status === 'Active' ? 'green' : 'gray'}>{project.status}</Badge>
              </Group>
              <Text size="sm" color="dimmed">Status: {project.status}</Text>
              <Text size="xs" color="dimmed" style={{ marginTop: '1rem' }}>Last updated: {project.updatedAt}</Text>
              <Group position="right" style={{ marginTop: '1rem' }}>
                <ActionIcon variant="default" size="lg">
                  <IconPencil size="1.1rem" stroke={1.5} />
                </ActionIcon>
                <ActionIcon variant="default" size="lg" onClick={() => handleDeleteProject(project.id)}>
                  <IconTrash size="1.1rem" stroke={1.5} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </div>
      </section>
      
      <section>
        <Group position="apart" style={{ marginBottom: '1rem' }}>
          <Text size="xl" weight={700}>Search Queue</Text>
          <Button onClick={() => setIsAddToSearchQueueModalOpen(true)}>Add to Search Queue</Button>
        </Group>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {searches.map(search => (
            <Card key={search.id} shadow="sm" padding="lg">
              <Group position="apart" style={{ marginBottom: 5 }}>
                <Text weight={500}>{search.productIdea}</Text>
                <Badge color={search.status === 'Active' ? 'green' : 'gray'}>{search.status}</Badge>
              </Group>
              <Text size="sm" color="dimmed">Keywords: {search.keywords.join(', ')}</Text>
              <Group position="apart" style={{ marginTop: '1rem' }}>
                <Text size="sm" color="dimmed">Progress:</Text>
                <Progress value={search.progress} style={{ width: '60%' }} />
              </Group>
            </Card>
          ))}
        </div>
      </section>

      <Modal opened={isCreateProjectModalOpen} onClose={() => setIsCreateProjectModalOpen(false)} title="Create New Project">
        <TextInput
          label="Project Name"
          placeholder="Enter project name"
          value={newProjectName}
          onChange={(event) => setNewProjectName(event.currentTarget.value)}
          style={{ marginBottom: '1rem' }}
        />
        <Button onClick={handleCreateProject}>Create Project</Button>
      </Modal>

      <Modal opened={isAddToSearchQueueModalOpen} onClose={() => setIsAddToSearchQueueModalOpen(false)} title="Add to Search Queue">
        <Select
          label="Project"
          placeholder="Select a project"
          data={projects.map(project => ({ value: project.id, label: project.name }))}
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          style={{ marginBottom: '1rem' }}
        />
        <TextInput
          label="Product Idea"
          placeholder="Enter product idea"
          value={productIdea}
          onChange={(event) => setProductIdea(event.currentTarget.value)}
          style={{ marginBottom: '1rem' }}
        />
        <TextInput
          label="Keywords"
          placeholder="Enter comma-separated keywords"
          value={keywords}
          onChange={(event) => setKeywords(event.currentTarget.value)}
          style={{ marginBottom: '1rem' }}
        />
        <Button onClick={handleAddToSearchQueue}>Add to Queue</Button>
      </Modal>
    </div>
  );
}