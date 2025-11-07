function hashString(s = '') {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRand(seed) {
  let x = (seed || 123456789) >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff * 2 - 1;
  };
}

const STOP = new Set(['the','and','for','with','this','that','you','your','are','was','were','from','into','will','have','has','had','to','of','in','on','at','by','it','as','is','a','an','or','be','we','our','us']);

function words(text = '') {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(w => !STOP.has(w));
}

function topKeywords(text = '', n = 8) {
  const freq = new Map();
  for (const w of words(text)) freq.set(w, (freq.get(w) || 0) + 1);
  return Array.from(freq.entries())
    .sort((a,b)=>b[1]-a[1])
    .slice(0,n)
    .map(([w])=>w);
}

function splitSentences(text='') {
  return text.replace(/\s+/g, ' ')
             .split(/(?<=[.!?])\s+/)
             .map(s=>s.trim())
             .filter(Boolean);
}

function rewriteText(text='', intent='improve') {
  const synonyms = [
    ['good','great'],['bad','poor'],['students','learners'],['university','campus'],
    ['improve','enhance'],['create','craft'],['build','develop'],['fast','rapid']
  ];
  let out = ' ' + text + ' ';
  for (const [a,b] of synonyms) {
    out = out.replace(new RegExp(`\\b${a}\\b`, 'gi'),
      m => m[0] === m[0].toUpperCase() ? b.charAt(0).toUpperCase()+b.slice(1) : b
    );
  }
  out = out.replace(/\s+/g, ' ').trim();

  if (intent === 'concise') {
    const sents = splitSentences(out);
    const keep = Math.max(1, Math.ceil(sents.length * 0.6));
    out = sents.slice(0, keep).join(' ');
  }

  if (intent === 'explain') {
    out = 'In simple terms: ' + out;
  }

  const kws = topKeywords(text, 3);
  if (kws.length) out += `\n\nKeywords: ${kws.map(k => `#${k}`).join(' ')}`;
  return out;
}

function summarizeText(text='', lines=3) {
  const sents = splitSentences(text);
  const kws = topKeywords(text, 5);
  const scored = sents.map(s=>({
    s,
    score: kws.reduce((t,k)=>t+(s.toLowerCase().includes(k)?2:0),0) + Math.min(1,s.length/100)
  }));
  scored.sort((a,b)=>b.score-a.score);
  const pick = scored.slice(0, lines).map(x=>x.s);
  return pick.map(s=>`• ${s}`).join('\n');
}

function tagsFrom(text='') {
  const tags = topKeywords(text, 10);
  return JSON.stringify(tags);
}

function translateText(text='', target='Hindi') {
  return `Translated to ${target}: ${text}`;
}

function tweetThreadFrom(text='') {
  const clean = text.replace(/\s+/g,' ').trim();
  const parts = [];
  let i = 0;
  const max = 260;
  while (i < clean.length) {
    parts.push(clean.slice(i, i+max));
    i += max;
  }
  if (parts.length < 5) {
    const extra = ' ' + topKeywords(text, 6).join(' • ');
    while (parts.length < 5) parts.push(extra.slice(0, max));
  }
  if (parts.length > 10) parts.length = 10;
  const total = parts.length;
  return JSON.stringify(parts.map((p, idx)=>`(${idx+1}/${total}) ${p}`));
}

async function generateText({ prompt='', system='' }) {
  console.log('🧩 Mock AI used');
  const combined = (system + '\n' + prompt).toLowerCase();
  const input = prompt.split('\n').slice(-1)[0].trim();

  if (/summarize/.test(combined)) return { text: summarizeText(input), used: true, reason: 'ok:mock-ai' };
  if (/tag/.test(combined)) return { text: tagsFrom(input), used: true, reason: 'ok:mock-ai' };
  if (/tweet/.test(combined)) return { text: tweetThreadFrom(input), used: true, reason: 'ok:mock-ai' };
  if (/translate/.test(combined)) return { text: translateText(input, 'Hindi'), used: true, reason: 'ok:mock-ai' };

  const intent = /concise/.test(combined) ? 'concise' : /explain/.test(combined) ? 'explain' : 'improve';
  return { text: rewriteText(input, intent), used: true, reason: 'ok:mock-ai' };
}

async function embedTexts(texts=[]) {
  console.log('🧩 Mock AI used');
  const out = texts.map(t => {
    const rng = seededRand(hashString(t));
    const dims = 8 + (Math.abs(hashString(t)) % 3);
    return Array.from({length: dims}, () => Number(rng().toFixed(6)));
  });
  return { embeddings: out, used: true, reason: 'ok:mock-ai' };
}

module.exports = { generateText, embedTexts };
