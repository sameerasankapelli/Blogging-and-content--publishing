const express = require('express');
const { rate } = require('../middleware/rateLimit');
const { generateText, embedTexts } = require('../services/gemini');

const router = express.Router();

// Helper to standardize errors
function safe(res, fn) {
  return Promise.resolve(fn()).catch((e) => {
    res.status(500).json({ error: e?.message || 'server_error' });
  });
}

router.post('/rewrite', rate('ai:rewrite', 20, 60_000), (req, res) => safe(res, async () => {
  const { text = '', intent = 'improve', context = '' } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  const map = {
    improve: 'Improve the tone and clarity while keeping meaning intact. Keep markdown formatting. Return only the improved text.',
    concise: 'Rewrite to be 30% shorter, preserving key points. Keep markdown formatting. Return only the revised text.',
    explain: 'Rewrite for a beginner. Use simple language and short sentences. Keep markdown formatting. Return only the rewritten text.'
  };
  const instruction = map[intent] || map.improve;
  const payload = {
    system: 'You are an expert writing assistant for a blogging platform. Be concise and preserve author voice.',
    prompt: `${instruction}\n\n${context ? `Context: ${context}\n\n` : ''}Input:\n${text}`,
  };
  let { text: out, used, reason } = await generateText(payload);
  if (!out) return res.status(502).json({ error: 'ai_unavailable', reason: reason || 'mock_failed' });
  res.json({ text: out, provider: 'mock-ai', reason });
}));

router.post('/tags', rate('ai:tags', 20, 60_000), (req, res) => safe(res, async () => {
  const { text = '' } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  let payload = {
    system: 'You create concise, relevant tags for blog posts.',
    prompt: 'From the following post content and title, generate 5-10 short tags (1-3 words). Respond ONLY with a JSON array of strings.\n\n' + text,
  };
  let { text: out, reason } = await generateText(payload);
  if (!out) return res.status(502).json({ error: 'ai_unavailable', reason: reason || 'mock_failed' });
  try {
    const json = JSON.parse(out.replace(/```json|```/g, ''));
    const tags = (Array.isArray(json) ? json : []).map(String).map(s => s.replace(/^#/, '')).slice(0, 10);
    res.json({ tags });
  } catch {
    // fallback: extract top keywords by frequency
    const words = (text.toLowerCase().match(/[a-zA-Z][a-zA-Z0-9-]{2,}/g) || []);
    const stop = new Set(['the','and','for','with','this','that','you','are','your','from','into','into','use','using','have','has','was','were','can','will','about','when','how','what','why','where']);
    const freq = new Map();
    for (const w of words) { if (!stop.has(w)) freq.set(w, (freq.get(w)||0)+1); }
    const tags = Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>w);
    res.json({ tags });
  }
}));

router.post('/summarize', rate('ai:summarize', 20, 60_000), (req, res) => safe(res, async () => {
  const { text = '', lines = 3 } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  let payload = {
    system: 'You summarize articles clearly and concisely.',
    prompt: `Summarize the following content in ${Math.max(1, Math.min(8, Number(lines)||3))} bullet lines. Keep it factual. Return only the summary lines.\n\n${text}`,
  };
  let { text: out, reason } = await generateText(payload);
  if (!out) return res.status(502).json({ error: 'ai_unavailable', reason: reason || 'mock_failed' });
  res.json({ summary: out.trim() });
}));

router.post('/tweet_thread', rate('ai:tweet', 20, 60_000), (req, res) => safe(res, async () => {
  const { text = '' } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  let payload = {
    system: 'You craft engaging X (Twitter) threads.',
    prompt: 'Create a 6-10 tweet thread from this article. Each tweet must be < 270 characters, numbered (1/n), and self-contained. Respond ONLY with a JSON array of strings.\n\n' + text,
  };
  let { text: out, reason } = await generateText(payload);
  if (!out) return res.status(502).json({ error: 'ai_unavailable', reason: reason || 'mock_failed' });
  try {
    const tweets = JSON.parse(out.replace(/```json|```/g, ''));
    res.json({ tweets: Array.isArray(tweets) ? tweets : [] });
  } catch {
    const lines = out.split('\n').filter(Boolean);
    res.json({ tweets: lines.slice(0, 10) });
  }
}));

router.post('/translate', rate('ai:translate', 20, 60_000), (req, res) => safe(res, async () => {
  const { text = '', targetLang = 'Hindi' } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  let payload = {
    system: 'You translate text while preserving meaning and markdown formatting.',
    prompt: `Translate the following content to ${targetLang}. Keep markdown formatting. Return only the translated text.\n\n${text}`,
  };
  let { text: out, reason } = await generateText(payload);
  if (!out) return res.status(502).json({ error: 'ai_unavailable', reason: reason || 'mock_failed' });
  res.json({ text: out.trim(), lang: targetLang });
}));

router.post('/embeddings', rate('ai:embed', 10, 60_000), (req, res) => safe(res, async () => {
  const { texts = [] } = req.body || {};
  if (!Array.isArray(texts) || texts.length === 0) return res.status(400).json({ error: 'texts_required' });
  const { embeddings } = await embedTexts(texts);
  if (!embeddings) return res.status(502).json({ error: 'ai_unavailable' });
  res.json({ embeddings });
}));

router.get('/debug', (_req, res) => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  res.json({
    ok: true,
    gemini: {
      hasKey: hasGemini,
      primaryModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      httpBases: ['v1', 'v1beta'],
      fallbacks: ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-1.5-pro-latest']
    },
  });
});

module.exports = router;
