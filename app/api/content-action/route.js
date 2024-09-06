import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { postToReddit } from '@/lib/redditApi'; // Assume this function exists to post content to Reddit

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'You must be logged in to perform this action.' });
  }

  const { suggestion, type, action } = req.body;

  try {
    // Validate input
    if (!suggestion || !suggestion.id || !type || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['post', 'reply', 'engagement'].includes(type)) {
      return res.status(400).json({ error: 'Invalid suggestion type' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
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

    res.status(200).json({ 
      message: `${type} ${action}ed successfully`,
      suggestion: finalSuggestion
    });
  } catch (error) {
    console.error('Error in content-action:', error);
    res.status(500).json({ error: `Failed to ${action} ${type}` });
  } finally {
    await prisma.$disconnect();
  }
}