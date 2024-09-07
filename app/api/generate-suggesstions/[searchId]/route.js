import { generateContentSuggestions } from '../../../lib/contentSuggestion';

export async function GET(req) {
  const { searchId } = new URL(req.url).searchParams;

  try {
    const suggestions = await generateContentSuggestions(searchId);
    return new Response(JSON.stringify(suggestions), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), { status: 500 });
  }
}

export function POST() {
  return new Response(`Method POST Not Allowed`, { status: 405 });
}
