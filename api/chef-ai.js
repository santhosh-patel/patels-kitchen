/* eslint-env node */
const rateLimitLocal = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown';
}

async function isRateLimitedUpstash(ip) {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken) return null;

  const windowIndex = Math.floor(Date.now() / RATE_WINDOW_MS);
  const key = `pk_ratelimit:${ip}:${windowIndex}`;

  try {
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, Math.floor(RATE_WINDOW_MS / 1000)]
      ])
    });

    if (!res.ok) {
      console.warn('Upstash Redis pipeline failed, using local rate limiter fallback.');
      return null;
    }

    const data = await res.json();
    const count = data[0]?.result ?? 0;
    return count > RATE_LIMIT;
  } catch (err) {
    console.error('Error in Upstash Redis rate limiter:', err);
    return null;
  }
}

function isRateLimitedLocal(ip) {
  const now = Date.now();
  const entry = rateLimitLocal.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW_MS;
  }
  entry.count += 1;
  rateLimitLocal.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Chef AI unavailable — GROQ_API_KEY not configured' });
  }

  const ip = getClientIp(req);
  let rateLimited = await isRateLimitedUpstash(ip);
  if (rateLimited === null) {
    rateLimited = isRateLimitedLocal(ip);
  }

  if (rateLimited) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const { messages, model = 'llama-3.1-8b-instant' } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 700
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({ error: errText });
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
