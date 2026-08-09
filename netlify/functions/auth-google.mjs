import { db } from './_shared/db.mjs';
import { verifyGoogleIdToken } from './_shared/google.mjs';
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

  const idToken = typeof body.idToken === 'string' ? body.idToken : '';
  if (!idToken) {
    return error(400, 'idToken é obrigatório');
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(idToken);
  } catch {
    return error(401, 'Token do Google inválido');
  }

  const email = identity.email.toLowerCase();

  const [byGoogleSub] = await db().sql`
    SELECT id, email, display_name AS "displayName" FROM users WHERE google_sub = ${identity.sub}
  `;

  let user = byGoogleSub;

  if (!user) {
    const [byEmail] = await db().sql`
      SELECT id, email, display_name AS "displayName" FROM users WHERE email = ${email}
    `;

    if (byEmail) {
      // Link the Google identity to an existing email/password account, but
      // only when Google has itself verified that email — otherwise anyone
      // could take over an account just by typing someone else's address.
      if (!identity.emailVerified) {
        return error(401, 'Email do Google não verificado');
      }
      [user] = await db().sql`
        UPDATE users SET google_sub = ${identity.sub}
        WHERE id = ${byEmail.id}
        RETURNING id, email, display_name AS "displayName"
      `;
    } else {
      [user] = await db().sql`
        INSERT INTO users (email, google_sub, display_name)
        VALUES (${email}, ${identity.sub}, ${identity.name})
        RETURNING id, email, display_name AS "displayName"
      `;
    }
  }

  const setCookie = await createSession(user.id, request.headers.get('user-agent'));

  return json({ user }, { headers: { 'set-cookie': setCookie } });
};

export const config = { path: '/api/auth/google' };
