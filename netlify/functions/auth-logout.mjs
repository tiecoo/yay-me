import { revokeSession, clearSessionCookie } from './_shared/session.mjs';
import { json, error } from './_shared/http.mjs';

export default async request => {
  if (request.method !== 'POST') {
    return error(405, 'Method Not Allowed');
  }

  await revokeSession(request);

  return json({}, { headers: { 'set-cookie': clearSessionCookie() } });
};

export const config = { path: '/api/auth/logout' };
