const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TEXT_LENGTH = 280;
const REQUEST_TIMEOUT_MS = 6000;

const SYSTEM_PROMPT = [
  'Você gera frases curtas de celebração para o app Yay-me, que ajuda pessoas a registrar pequenas conquistas diárias.',
  'Dada a conquista descrita pelo usuário, responda com UMA única frase em português do Brasil, calorosa, direta e levemente bem-humorada, parabenizando a pessoa especificamente pelo que ela descreveu.',
  'Regras: no máximo 140 caracteres, sem aspas, sem markdown, sem emojis, apenas o texto puro da frase.'
].join(' ');

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let text;
  try {
    ({ text } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (typeof text !== 'string' || !text.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing "text"' }) };
  }

  const achievementText = text.trim().slice(0, MAX_TEXT_LENGTH);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 80,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: achievementText }]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
    }

    const data = await response.json();
    const phrase = data?.content?.[0]?.text?.trim();

    if (!phrase) {
      return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
    }

    return { statusCode: 200, body: JSON.stringify({ phrase }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
  } finally {
    clearTimeout(timer);
  }
};
