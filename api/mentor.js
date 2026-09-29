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

  const callGemini = async (model) => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1536, responseMimeType: 'application/json' }
      })
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const PRIMARY_MODEL = 'gemini-3.8-flash';
  const FALLBACK_MODEL = 'gemini-3.6-flash';

  try {
    let text;
    try {
      text = await callGemini(PRIMARY_MODEL);
    } catch (e1) {
      // 一時的な混雑（overloaded/高需要）なら少し待って1回だけ再試行
      if (/overload|high demand|503|429/i.test(e1.message)) {
        await sleep(1500);
        try {
          text = await callGemini(PRIMARY_MODEL);
        } catch (e2) {
          // それでもダメなら別モデルに切り替えて最後の再試行
          text = await callGemini(FALLBACK_MODEL);
        }
      } else {
        // モデル廃止など一時的でないエラーの場合は、別モデルで即座に再試行
        text = await callGemini(FALLBACK_MODEL);
      }
    }
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
