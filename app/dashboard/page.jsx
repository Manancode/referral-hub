import Dashboard from './Dashboard';
import prisma from '../lib/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    // Handle unauthorized access
    return <div>Unauthorized access. Please log in.</div>;
  }

  const [projects, user, searchQueue] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    }),
    prisma.searchQueue.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <Dashboard 
      projects={projects}
      userTier={user?.subscriptionTier || 'FREE'}
      searchQueue={searchQueue}
      userId={session.user.id}
    />
  );
}