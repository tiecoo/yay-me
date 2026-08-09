import { randomBytes, createHash } from 'node:crypto';
import { db } from './db.mjs';
import { getCookie, buildSetCookie, SESSION_COOKIE_NAME } from './cookies.mjs';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId, userAgent) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db().sql`
    INSERT INTO sessions (token_hash, user_id, expires_at, user_agent)
    VALUES (${tokenHash}, ${userId}, ${expiresAt}, ${userAgent ?? null})
  `;

  return buildSetCookie(SESSION_COOKIE_NAME, token, { maxAgeSeconds: SESSION_TTL_SECONDS });
}

export async function getSessionUser(request) {
  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const rows = await db().sql`
    SELECT u.id, u.email, u.display_name AS "displayName"
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now()
  `;

  return rows[0] ?? null;
}

export async function revokeSession(request) {
  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);
  await db().sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}

export function clearSessionCookie() {
  return buildSetCookie(SESSION_COOKIE_NAME, '', {});
}
