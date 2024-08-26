import Dashboard from './Dashboard';
import prisma from '../lib/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  return <Dashboard projects={projects} />;
}