import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { PrismaClient } from '@prisma/client';
import { sendDirectMessage } from '@/lib/redditApi';
import { generatePersonalizedMessage } from '@/lib/messageGenerator';
import { RATE_LIMIT } from '@/lib/constants';

const prisma = new PrismaClient();

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipientUsername, templateId, customFields } = await request.json();

    if (!recipientUsername || !templateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check rate limit
    const recentMessages = await prisma.directMessage.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT.period)
        }
      }
    });

    if (recentMessages >= RATE_LIMIT.maxMessages) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Generate personalized message
    const messageTemplate = await prisma.messageTemplate.findUnique({
      where: { id: templateId }
    });
    const personalizedMessage = generatePersonalizedMessage(messageTemplate.content, customFields);

    // Send DM via Reddit API
    const messageResult = await sendDirectMessage(recipientUsername, personalizedMessage);

    // Save DM record
    const dmRecord = await prisma.directMessage.create({
      data: {
        userId: session.user.id,
        recipientUsername,
        messageContent: personalizedMessage,
        status: messageResult.success ? 'SENT' : 'FAILED',
      }
    });

    return NextResponse.json({
      message: 'Direct message sent successfully',
      dmId: dmRecord.id,
    });
  } catch (error) {
    console.error('Error sending direct message:', error);
    return NextResponse.json({ error: 'Failed to send direct message', details: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outreachStrategies = await prisma.outreachStrategy.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        relevanceScore: 'desc',
      },
    });

    return NextResponse.json(outreachStrategies);
  } catch (error) {
    console.error('Error fetching outreach strategies:', error);
    return NextResponse.json({ error: "Failed to fetch outreach strategies" }, { status: 500 });
  }
}