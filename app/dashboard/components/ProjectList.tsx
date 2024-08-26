
import React from "react";
import Link from "next/link";
import { Project } from "@/app/types/types";

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li key={project.id} className="border p-4 rounded-lg">
          <h2 className="text-2xl font-semibold">{project.name}</h2>
          <p className="text-gray-600 mb-2">{project.description}</p>
          <Link href={`/dashboard/projects/${project.id}`} className="text-blue-500 hover:underline">
            View Project
          </Link>
        </li>
      ))}
    </ul>
  );
}
