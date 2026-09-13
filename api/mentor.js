module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') return res.status(200).end();
            let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e) {} } const prompt = body?.prompt || '';
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 800 } })
                          });
                            const d = await r.json();
                              const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                                res.status(200).json({ text });
                                }
