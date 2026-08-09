export const SESSION_COOKIE_NAME = 'ym_session';

export function getCookie(request, name) {
  const header = request.headers.get('cookie');
  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = part.slice(0, separatorIndex).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }

  return null;
}

export function buildSetCookie(name, value, { maxAgeSeconds } = {}) {
  const isDev = Netlify.env.get('CONTEXT') === 'dev';
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];

  if (!isDev) {
    parts.push('Secure');
  }

  if (typeof maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  } else {
    // Max-Age=0 deletes the cookie immediately (used on logout).
    parts.push('Max-Age=0');
  }

  return parts.join('; ');
}
