import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: 'You are AI Sensei, an expert on Street Fighter 6 — strategy, players, events, results, patch notes, meta and frame data. Be concise, accurate, and helpful.',
      messages,
    });
    const text = resp.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n');
    return Response.json({ content: text });
  } catch (e: any) {
    return Response.json(
      { content: 'Sensei error: ' + (e?.message || 'unknown') },
      { status: 500 }
    );
  }
}