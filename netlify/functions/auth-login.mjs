import { db } from './_shared/db.mjs';
import { verifyPassword } from './_shared/password.mjs';
import { createSession } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

export default async request => {
  if (request.method !== 'POST') {
    return error(405, 'Method Not Allowed');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error(400, 'Corpo inválido');
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return error(400, 'Email e senha são obrigatórios');
  }

  const [user] = await db().sql`
    SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash"
    FROM users WHERE email = ${email}
  `;

  if (!user || !user.passwordHash) {
    return error(401, 'Email ou senha incorretos');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return error(401, 'Email ou senha incorretos');
  }

  const setCookie = await createSession(user.id, request.headers.get('user-agent'));

  return json(
    { user: { id: user.id, email: user.email, displayName: user.displayName } },
    { headers: { 'set-cookie': setCookie } }
  );
};

export const config = { path: '/api/auth/login' };
