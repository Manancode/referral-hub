import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const latestSearch = await prisma.search.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ searchId: latestSearch.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest search' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}