import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { PrismaClient } from '@prisma/client';
import { generateWithGPT } from '../../lib/openaiconfig';
import { REDDIT_RATE_LIMIT, TIER_LIMITS } from '../../lib/constants';

const prisma = new PrismaClient();

const DM_RATE_LIMIT = {
  maxMessages: 50,  // Adjust this value as needed
  period: REDDIT_RATE_LIMIT.period
};

async function generatePersonalizedMessage(templateContent, customFields, recipientUsername) {
  const prompt = `Given the following message template and custom fields, create a personalized message for Reddit user ${recipientUsername}.
  Template: ${templateContent}
  Custom Fields: ${JSON.stringify(customFields)}
  Ensure the message is friendly, engaging, and not overtly promotional.`;

  return await generateWithGPT(prompt, 200);  // Adjust token limit as needed
}

async function sendRedditMessage(senderUserId, recipientUsername, messageContent) {
  // TODO: Implement actual Reddit API call here
  // This is a placeholder function that simulates sending a message
  console.log(`Sending message to ${recipientUsername} from user ${senderUserId}: ${messageContent}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock result
  return { success: true, messageId: 'mock-message-id-' + Date.now() };
}

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

    // Fetch user's tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true }
    });

    // Check rate limit
    const recentMessages = await prisma.directMessage.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - DM_RATE_LIMIT.period)
        }
      }
    });

    if (recentMessages >= DM_RATE_LIMIT.maxMessages) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Check daily limit based on user's tier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesSentToday = await prisma.directMessage.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today
        }
      }
    });

    if (messagesSentToday >= TIER_LIMITS[user.tier].resultsPerDay) {
      return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
    }

    // Generate personalized message
    const messageTemplate = await prisma.messageTemplate.findUnique({
      where: { id: templateId }
    });
    const personalizedMessage = await generatePersonalizedMessage(messageTemplate.content, customFields, recipientUsername);

    // Send the message using the placeholder function
    const sendResult = await sendRedditMessage(session.user.id, recipientUsername, personalizedMessage);

    // Save the message record
    const messageRecord = await prisma.directMessage.create({
      data: {
        userId: session.user.id,
        recipientUsername,
        messageContent: personalizedMessage,
        status: sendResult.success ? 'SENT' : 'FAILED',
        redditMessageId: sendResult.messageId,
      }
    });

    return NextResponse.json({
      message: 'Direct message sent successfully',
      messageId: messageRecord.id,
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