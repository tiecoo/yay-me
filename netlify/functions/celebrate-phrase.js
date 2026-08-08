const HF_ROUTER_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash-0731:novita';
const MAX_TEXT_LENGTH = 280;
const REQUEST_TIMEOUT_MS = 6000;

const SYSTEM_PROMPT = [
  'Você gera frases curtas de celebração para o app Yay-me, que ajuda pessoas a registrar pequenas conquistas diárias.',
  'Dada a conquista descrita pelo usuário, responda com UMA única frase em português do Brasil que faça uma piadinha leve e específica sobre o que a pessoa descreveu — não uma frase genérica que serviria pra qualquer conquista.',
  'Pegue algum detalhe concreto do texto (a atividade, o objeto, a situação) e brinque com ele, sempre de forma carinhosa, nunca sarcástica ou debochada — o objetivo é fazer a pessoa sorrir e se sentir bem, não zoar dela.',
  'Regras: no máximo 140 caracteres, sem aspas, sem markdown, sem emojis, apenas o texto puro da frase.'
].join(' ');

const USER_MESSAGE_CONTEXT_PREFIX =
  'Isso é para apoiar e animar a pessoa que registrou essa conquista pessoal — faça uma piadinha bem-humorada e específica sobre o que ela descreveu, pra deixá-la feliz. A conquista descrita é: ';

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

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(HF_ROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 80,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${USER_MESSAGE_CONTEXT_PREFIX}"${achievementText}"` }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { statusCode: 200, body: JSON.stringify({ phrase: null }) };
    }

    const data = await response.json();
    const phrase = data?.choices?.[0]?.message?.content?.trim();

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
