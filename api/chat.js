// Vercel serverless function — /api/chat
// Powered by Google Gemini 1.5 Flash (free tier: 1,500 req/day, no credit card)
// Get a free key at: aistudio.google.com/apikey
// Add GEMINI_API_KEY to Vercel Environment Variables

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat not configured — add GEMINI_API_KEY to Vercel' });
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

  // Gemini uses 'user' / 'model' roles (not 'assistant')
  const history = messages.slice(-10).filter(m =>
    m.role && m.content && typeof m.content === 'string'
  ).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: history,
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.7,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', response.status, err);
      return res.status(502).json({ error: 'AI service error — try again shortly', _debug: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return res.status(200).json({ reply: "I didn't quite catch that. Could you rephrase your question?" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply: text.trim() });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again' });
  }
}
