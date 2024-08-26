// app/dashboard/projects/[id]/page.tsx
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateProjectForm from '../../components/CreateProjectForm';
import SearchForm from '../../components/SearchForm';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        // If the project doesn't exist, we'll keep the project state as null
        console.log('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: { id: string; name: string }) => {
    setProject(newProject);
    router.push(`/dashboard/projects/${newProject.id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Create a New Project</h1>
        <CreateProjectForm onProjectCreated={handleProjectCreated} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-8">{project.description}</p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">New Search</h2>
        <SearchForm projectId={project.id} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Searches</h2>
        {project.searches && project.searches.length > 0 ? (
          <ul className="space-y-4">
            {project.searches.map((search: any) => (
              <li key={search.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-medium">
                    Keywords: {search.keywords.join(", ")}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">
                  Results: {search.results.length}
                </p>
                <Link
                  href={`/dashboard/projects/${params.id}/results/${search.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Results
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No searches yet for this project.</p>
        )}
      </div>
    </div>
  );
}