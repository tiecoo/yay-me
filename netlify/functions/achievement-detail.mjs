import { db } from './_shared/db.mjs';
import { getSessionUser } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 24;

export default async (request, context) => {
  const user = await getSessionUser(request);
  if (!user) {
    return error(401, 'Não autenticado');
  }

  const id = context.params.id;

  if (request.method === 'PATCH') {
    let body;
    try {
      body = await request.json();
    } catch {
      return error(400, 'Corpo inválido');
    }

    const hasTags = Array.isArray(body.tags);
    const hasCategoryId = 'categoryId' in body;

    if (!hasTags && !hasCategoryId) {
      return error(400, 'Nada para atualizar');
    }

    const [existing] = await db().sql`
      SELECT tags, category_id AS "categoryId" FROM achievements WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (!existing) {
      return error(404, 'Conquista não encontrada');
    }

    const nextTags = hasTags
      ? body.tags
          .filter(tag => typeof tag === 'string' && tag.trim())
          .map(tag => tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH))
          .slice(0, MAX_TAGS)
      : existing.tags;
    const nextCategoryId = hasCategoryId
      ? typeof body.categoryId === 'string' && body.categoryId
        ? body.categoryId
        : null
      : existing.categoryId;

    // Two-step read-then-write instead of a single CASE-WHEN UPDATE: it keeps
    // every bound parameter's Postgres type unambiguous (a bare ${null} in a
    // CASE branch can otherwise fail type inference for the text[] column).
    const [achievement] = await db().sql`
      UPDATE achievements
      SET tags = ${nextTags}, category_id = ${nextCategoryId}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, text, category_id AS "categoryId", tags, created_at AS "createdAt"
    `;

    return json({ achievement });
  }

  if (request.method === 'DELETE') {
    const rows = await db().sql`
      DELETE FROM achievements WHERE id = ${id} AND user_id = ${user.id} RETURNING id
    `;

    if (!rows[0]) {
      return error(404, 'Conquista não encontrada');
    }

    return json({ deleted: true });
  }

  return error(405, 'Method Not Allowed');
};

export const config = { path: '/api/achievements/:id' };
