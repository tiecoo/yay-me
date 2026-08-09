import { jwtVerify, createRemoteJWKSet } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

// Verifies a Google Identity Services ID token server-side (signature, issuer,
// audience, expiry) and returns the identity claims we care about.
export async function verifyGoogleIdToken(idToken) {
  const clientId = Netlify.env.get('GOOGLE_CLIENT_ID');
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID não configurado');
  }

  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId
  });

  if (!payload.email || !payload.sub) {
    throw new Error('Token do Google sem email/sub');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : null
  };
}
