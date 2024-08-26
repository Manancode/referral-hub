"use client"

import Link from "next/link";

export default function ProjectCard({ project } : any ) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-gray-600">{project.description}</p>
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="text-blue-500 hover:underline mt-2 inline-block"
      >
        View Project
      </Link>
    </div>
  );
}