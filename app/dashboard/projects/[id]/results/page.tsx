import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// Fetch search results for a specific search ID
async function getSearchResults(searchId: string, userId: string) {
  const search = await prisma.search.findFirst({
    where: {
      id: searchId,
      userId,
    },
    include: {
      results: true,
    },
  });

  if (!search) notFound();
  return search;
}

export default async function SearchResultsPage({ params }: { params: { id: string; searchId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const search = await getSearchResults(params.searchId, session.user.id);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Keywords: {search.keywords.join(", ")}
        </h2>
        <p className="text-gray-600">Total Results: {search.results.length}</p>
      </div>

      {search.results.length > 0 ? (
        <ul className="space-y-4">
          {search.results.map((result) => (
            <li key={result.id} className="border p-4 rounded-lg">
              <h3 className="text-xl font-medium">{result.postTitle}</h3>
              <p className="text-gray-600 mb-2">{result.postContent}</p>
              <p className="text-sm text-gray-500">
                Subreddit: {result.subreddit}
              </p>
              <p className="text-sm text-gray-500">
                Username: {result.username}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No results found for this search.</p>
      )}
    </div>
  );
}
