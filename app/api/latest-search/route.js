import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const latestSearch = await prisma.search.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify({ searchId: latestSearch?.id || null }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch latest search' }), { status: 500 });
  }
}

export function POST() {
  return new Response(`Method POST Not Allowed`, { status: 405 });
}
