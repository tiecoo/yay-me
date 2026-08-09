import { getSessionUser } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

export default async request => {
  if (request.method !== 'GET') {
    return error(405, 'Method Not Allowed');
  }

  const user = await getSessionUser(request);

  // Always 200, even when logged out — this is called on every app boot and
  // "not logged in" is a normal state, not an error.
  return json({ user });
};

export const config = { path: '/api/auth/me' };
