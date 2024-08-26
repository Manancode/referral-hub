"use client";
import { useSession } from "next-auth/react";
import ProjectCard from "./components/ProjectCard";
import SearchForm from "./components/SearchForm";

export default function Dashboard({ projects } : any) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to view this page</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <h2>Recent Projects</h2>
      {projects.map((project: { id: any; }) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <h2>New Search</h2>
      <SearchForm />
    </div>
  );
}