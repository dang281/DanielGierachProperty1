// Vercel serverless function — /api/chat
// Powers the Daniel Gierach Property chatbot widget

const SYSTEM_PROMPT = `You are the virtual assistant for Daniel Gierach Property, Ray White Bulimba. You help buyers, sellers and homeowners with property questions in Brisbane's inner east and south.

About Daniel Gierach:
- Licensed real estate agent at Ray White Bulimba
- Specialist in Brisbane's inner east and south suburbs
- Expert in: Bulimba, Balmoral, Hawthorne, Morningside, Norman Park, Camp Hill, Cannon Hill, Carina, Carina Heights, Carindale, Coorparoo, East Brisbane, Holland Park, Mt Gravatt, Murarrie, Seven Hills, Hawthorne
- Known for data-led campaigns, honest advice and strong auction results
- Contact: danielgierach.com | Ray White Bulimba office

Your role:
- Answer property questions accurately and helpfully
- Provide suburb-specific insights when asked
- Guide sellers and buyers through the process
- Encourage bookings for free appraisals at danielgierach.com/walkthrough
- Never make up specific prices or statistics — say you'd recommend checking live data or speaking with Daniel directly
- Keep answers concise (3-5 sentences max unless a detailed question is asked)
- Be warm, direct and professional — like Daniel himself

If someone asks about listing, selling, pricing or appraisals, always mention the free appraisal: "Daniel offers a free, no-obligation property walkthrough — you can book at danielgierach.com/walkthrough"

Do not discuss competitors, other agents, or anything unrelated to Brisbane property and Daniel's services.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat service not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  // Keep last 10 messages for context
  const trimmed = messages.slice(-10).filter(m =>
    m.role && m.content && typeof m.content === 'string'
  );

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'Service error' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';

    res.setHeader('Access-Control-Allow-Origin', 'https://danielgierach.com');
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
