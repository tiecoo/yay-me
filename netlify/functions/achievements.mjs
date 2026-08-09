import { db } from './_shared/db.mjs';
import { getSessionUser } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

const MAX_TEXT_LENGTH = 280;

export default async request => {
  const user = await getSessionUser(request);
  if (!user) {
    return error(401, 'Não autenticado');
  }

  if (request.method === 'GET') {
    const achievements = await db().sql`
      SELECT id, text, category_id AS "categoryId", tags, created_at AS "createdAt"
      FROM achievements
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
    return json({ achievements });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return error(400, 'Corpo inválido');
    }

    const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : '';
    const categoryId = typeof body.categoryId === 'string' && body.categoryId ? body.categoryId : null;

    if (!text) {
      return error(400, 'Texto é obrigatório');
    }

    const [achievement] = await db().sql`
      INSERT INTO achievements (user_id, text, category_id)
      VALUES (${user.id}, ${text}, ${categoryId})
      RETURNING id, text, category_id AS "categoryId", tags, created_at AS "createdAt"
    `;

    return json({ achievement }, { status: 201 });
  }

  return error(405, 'Method Not Allowed');
};

export const config = { path: '/api/achievements' };
