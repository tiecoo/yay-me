import { db } from './_shared/db.mjs';
import { getSessionUser } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

export default async request => {
  if (request.method !== 'GET') {
    return error(405, 'Method Not Allowed');
  }

  const user = await getSessionUser(request);
  if (!user) {
    return error(401, 'Não autenticado');
  }

  const categories = await db().sql`
    SELECT id, slug, label, icon FROM categories WHERE user_id IS NULL ORDER BY label
  `;

  return json({ categories });
};

export const config = { path: '/api/categories' };
