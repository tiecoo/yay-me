import { db } from './_shared/db.mjs';
import { getSessionUser } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

const MAX_TEXT_LENGTH = 280;
const MAX_ITEMS = 2000;

export default async request => {
  if (request.method !== 'POST') {
    return error(405, 'Method Not Allowed');
  }

  const user = await getSessionUser(request);
  if (!user) {
    return error(401, 'Não autenticado');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error(400, 'Corpo inválido');
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    const legacyId = typeof item?.legacyId === 'string' ? item.legacyId : null;
    const text = typeof item?.text === 'string' ? item.text.trim().slice(0, MAX_TEXT_LENGTH) : '';
    const createdAt = typeof item?.createdAt === 'string' ? item.createdAt : null;
    const tags = Array.isArray(item?.tags) ? item.tags.filter(tag => typeof tag === 'string') : [];

    if (!legacyId || !text || !createdAt) {
      skipped += 1;
      continue;
    }

    const rows = await db().sql`
      INSERT INTO achievements (user_id, text, tags, legacy_id, created_at)
      VALUES (${user.id}, ${text}, ${tags}, ${legacyId}, ${createdAt})
      ON CONFLICT (legacy_id) DO NOTHING
      RETURNING id
    `;

    if (rows[0]) {
      imported += 1;
    } else {
      skipped += 1;
    }
  }

  return json({ imported, skipped });
};

export const config = { path: '/api/achievements/import' };
