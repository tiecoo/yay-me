import { db } from './_shared/db.mjs';
import { hashPassword } from './_shared/password.mjs';
import { createSession } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
  const displayName = typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : null;

  if (!EMAIL_RE.test(email)) {
    return error(400, 'Email inválido');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return error(400, `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  const existing = await db().sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing[0]) {
    return error(409, 'Já existe uma conta com este email');
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db().sql`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (${email}, ${passwordHash}, ${displayName})
    RETURNING id, email, display_name AS "displayName"
  `;

  const setCookie = await createSession(user.id, request.headers.get('user-agent'));

  return json({ user }, { headers: { 'set-cookie': setCookie } });
};

export const config = { path: '/api/auth/register' };
