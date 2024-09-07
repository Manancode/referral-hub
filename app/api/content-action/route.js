import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { postToReddit } from '../../lib/redditApi';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { suggestion, type, action } = body;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'You must be logged in to perform this action.' }), { status: 401 });
    }

    // Validate input
    if (!suggestion || !suggestion.id || !type || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (!['post', 'reply', 'engagement'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid suggestion type' }), { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    // Update the ContentSuggestion in the database
    const updatedSuggestion = await prisma.contentSuggestion.update({
      where: { id: suggestion.id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        updatedAt: new Date()
      },
    });

    if (action === 'approve') {
      // If approved, attempt to post to Reddit
      try {
        const redditResponse = await postToReddit(updatedSuggestion);
        // You might want to store the Reddit post ID or other metadata
        await prisma.contentSuggestion.update({
          where: { id: suggestion.id },
          data: {
            redditPostId: redditResponse.id,
            postStatus: 'POSTED'
          },
        });
      } catch (redditError) {
        console.error('Failed to post to Reddit:', redditError);
        // You might want to set a status indicating the post was approved but failed to post
        await prisma.contentSuggestion.update({
          where: { id: suggestion.id },
          data: { postStatus: 'FAILED_TO_POST' },
        });
      }
    }

    // Fetch the updated suggestion with related data
    const finalSuggestion = await prisma.contentSuggestion.findUnique({
      where: { id: suggestion.id },
      include: { search: true },
    });

    return new Response(JSON.stringify({
      message: `${type} ${action}ed successfully`,
      suggestion: finalSuggestion
    }), { status: 200 });
  } catch (error) {
    console.error('Error in content-action:', error);
    return new Response(JSON.stringify({ error: `Failed to ${action} ${type}` }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
