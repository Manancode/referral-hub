import { generateContentSuggestions } from '../../lib/contentSuggestion';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const searchId = searchParams.get('searchId');

  if (!searchId) {
    return new Response(JSON.stringify({ error: 'Missing searchId' }), { status: 400 });
  }

  try {
    console.log('Generating suggestions for searchId:', searchId);
    const suggestions = await generateContentSuggestions(searchId);
    console.log('Suggestions generated successfully:', suggestions);
    return new Response(JSON.stringify(suggestions), { status: 200 });
  } catch (error) {
    console.error('Error in GET route:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions', details: error.message }), { status: 500 });
  }
}

export function POST() {
  return new Response(`Method POST Not Allowed`, { status: 405 });
}