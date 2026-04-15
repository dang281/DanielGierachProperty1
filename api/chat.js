// Vercel serverless function — /api/chat
// Powered by Claude Haiku (Anthropic)
// Add ANTHROPIC_API_KEY to Vercel Environment Variables

const SYSTEM_PROMPT = `You are the virtual assistant for Daniel Gierach Property, Ray White Bulimba. You help buyers, sellers and homeowners with property questions in Brisbane's inner east and south.

About Daniel Gierach:
- Licensed real estate agent at Ray White Bulimba
- Specialist in Brisbane's inner east and south suburbs
- Core suburbs: Bulimba, Balmoral, Hawthorne, Morningside, Norman Park, Camp Hill, Cannon Hill, Carina, Carina Heights, Carindale, Coorparoo, East Brisbane, Holland Park, Mt Gravatt, Mt Gravatt East, Murarrie, Seven Hills
- Known for data-led campaigns, honest advice and strong auction results
- Free appraisal bookings: danielgierach.com/walkthrough
- Website: danielgierach.com

Your role:
- Answer property questions accurately and helpfully
- Provide suburb-specific insights when asked (typical buyer profiles, what drives value, lifestyle)
- Guide sellers and buyers through the process (auctions, private treaty, timelines, preparation)
- Encourage free appraisal bookings for anyone asking about selling or pricing
- Keep answers concise — 2 to 4 sentences unless a detailed question is asked
- Be warm, direct and professional. No hype. No em dashes.

Key rules:
- Never quote specific median prices or market statistics — these change often. Instead say "Daniel can give you an accurate current figure during a free walkthrough"
- Always mention the free appraisal for selling or pricing questions: "Daniel offers a free, no-obligation property walkthrough — book at danielgierach.com/walkthrough"
- Do not discuss competitors or other agents
- Do not discuss topics unrelated to Brisbane property and Daniel's services
- If unsure, say "That's a great question for Daniel directly — you can reach him at danielgierach.com"`;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat not configured — add ANTHROPIC_API_KEY to Vercel' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages' });
  }

  // Normalise to role: user | assistant only
  const history = messages.slice(-10).filter(m =>
    m.role && m.content && typeof m.content === 'string'
  ).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      if (response.status === 429) {
        return res.status(503).json({ error: 'The assistant is busy right now. Please try again in a moment.' });
      }
      return res.status(502).json({ error: 'AI service error. Please try again shortly.' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    if (!text) {
      return res.status(200).json({ reply: "I didn't quite catch that. Could you rephrase your question?" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply: text.trim() });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
