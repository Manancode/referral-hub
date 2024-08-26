import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import ClientProjectContent from './ClientProjectContent'

export const dynamic = 'force-dynamic';


async function getProject(id, userId) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      searches: {
        include: { results: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) notFound();
  return project;
}

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
    return null;
  }

  const project = await getProject(params.id, session.user.id);

  const serializedProject = {
    ...project,
    searches: project.searches.map((search) => ({
      ...search,
      createdAt: search.createdAt.toISOString(),
      results: search.results.map((result) => ({
        ...result,
      })),
    })),
  };

  return <ClientProjectContent project={serializedProject} />;
}