"use client";

import Link from "next/link";
import SearchForm from "../components/SearchForm";

export default function ClientProjectContent({ project }) {
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
        {project.searches.length > 0 ? (
          <ul className="space-y-4">
            {project.searches.map((search) => (
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
                  href={`/dashboard/searches/${search.id}`}
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