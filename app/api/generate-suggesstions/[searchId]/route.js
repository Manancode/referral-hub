import { generateContentSuggestions } from '../../../lib/contentSuggestion';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { searchId } = req.query;

    try {
      const suggestions = await generateContentSuggestions(searchId);
      res.status(200).json(suggestions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}