import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { searchQueue } from '../../lib/searchQueue'

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productIdea, keywords, projectId } = await request.json();

    if (!productIdea || !keywords || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user.subscriptionTier) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
    }

    // Add the search to the queue instead of processing it immediately
   // In your POST handler
const job = await searchQueue.add({
  userId: session.user.id,
  productIdea,
  keywords,
  tier: user.subscriptionTier,
  projectId,
}

);


    // Create a search record in the database
    const search = await prisma.search.create({
      data: {
        userId: session.user.id,
        productIdea,
        keywords,
        projectId,
        status: 'queued',
      },
    });
    return NextResponse.json({ message: 'Search queued successfully', searchId: search.id , jobId : job.id});
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}


export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searches = await prisma.search.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(searches);
  } catch (error) {
    console.error('Error fetching searches:', error);
    return NextResponse.json({ error: "Failed to fetch searches" }, { status: 500 });
  }
}