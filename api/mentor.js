module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let prompt = '';
  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }
    if (typeof body === 'string') body = JSON.parse(body);
    prompt = body.prompt || '';
  } catch (e) {
    return res.status(400).json({ error: 'Bad request: ' + e.message });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY が Vercel に設定されていません' });
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 800 }
      })
    });
    const d = await r.json();
    if (d.error) return res.status(500).json({ error: d.error.message });
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
