const HF_ROUTER_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash-0731:novita';
const MAX_TEXT_LENGTH = 280;
const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 24;
const MAX_PHRASE_LENGTH = 140;
const REQUEST_TIMEOUT_MS = 6000;

const SYSTEM_PROMPT = [
  'Você gera conteúdo para o app Yay-me, que ajuda pessoas a registrar pequenas conquistas diárias.',
  'Dada a conquista descrita pelo usuário, você produz duas coisas:',
  '(1) "phrase": UMA única frase em português do Brasil que faça uma piadinha leve e específica sobre o que a pessoa descreveu — não uma frase genérica que serviria pra qualquer conquista. Pegue algum detalhe concreto do texto (a atividade, o objeto, a situação) e brinque com ele, sempre de forma carinhosa, nunca sarcástica ou debochada. Máximo 140 caracteres, sem aspas, sem markdown, sem emojis.',
  '(2) "tags": uma lista de até 3 tags curtas (1 a 2 palavras cada, em português, minúsculas, sem acento não é obrigatório, sem "#") que categorizam o tipo de conquista, por exemplo: trabalho, saúde, família, estudos, exercício, casa, financeiro, social, autocuidado, criatividade — use essas sugestões quando fizerem sentido, ou outras mais específicas ao texto.',
  'Responda ESTRITAMENTE em JSON válido, sem markdown, sem texto antes ou depois, exatamente no formato: {"phrase": "...", "tags": ["...", "..."]}'
].join(' ');

const USER_MESSAGE_CONTEXT_PREFIX =
  'Isso é para apoiar e animar a pessoa que registrou essa conquista pessoal — faça uma piadinha bem-humorada e específica sobre o que ela descreveu, pra deixá-la feliz, e categorize com tags curtas. A conquista descrita é: ';

const EMPTY_RESULT = { phrase: null, tags: [] };

function parseModelJson(raw) {
  if (!raw) {
    return null;
  }

  const withoutFences = raw
    .trim()
    .replace(/^```(json)?/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
    // fall through to substring extraction below
  }

  const match = withoutFences.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function extractResult(rawContent) {
  const parsed = parseModelJson(rawContent);

  const phrase = typeof parsed?.phrase === 'string' && parsed.phrase.trim() ? parsed.phrase.trim().slice(0, MAX_PHRASE_LENGTH) : null;

  const tags = Array.isArray(parsed?.tags)
    ? parsed.tags
        .filter(tag => typeof tag === 'string' && tag.trim())
        .map(tag => tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH))
        .slice(0, MAX_TAGS)
    : [];

  return { phrase, tags };
}

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
    return { statusCode: 200, body: JSON.stringify(EMPTY_RESULT) };
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
        max_tokens: 150,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${USER_MESSAGE_CONTEXT_PREFIX}"${achievementText}"` }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { statusCode: 200, body: JSON.stringify(EMPTY_RESULT) };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const result = extractResult(rawContent);

    if (!result.phrase) {
      return { statusCode: 200, body: JSON.stringify(EMPTY_RESULT) };
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch {
    return { statusCode: 200, body: JSON.stringify(EMPTY_RESULT) };
  } finally {
    clearTimeout(timer);
  }
};
