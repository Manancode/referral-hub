import { generateContentSuggestions } from '../../../lib/contentSuggestion';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const searchId = searchParams.get('searchId'); // Correct way to get query parameters

  if (!searchId) {
    return new Response(JSON.stringify({ error: 'Missing searchId' }), { status: 400 });
  }

  try {
    const suggestions = await generateContentSuggestions(searchId);
    return new Response(JSON.stringify(suggestions), { status: 200 });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), { status: 500 });
  }
}

export function POST() {
  return new Response(`Method POST Not Allowed`, { status: 405 });
}
