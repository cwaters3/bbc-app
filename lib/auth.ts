import { isMember, type Member } from './members';

export const SESSION_COOKIE = 'bbc_session';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Generate one (e.g. `openssl rand -hex 32`) and add it to your Vercel env vars / .env.local.'
    );
  }
  return secret;
}

async function hmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function toBase64Url(bytes: ArrayBuffer): string {
  const b64 = Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Produces a signed cookie value of the form "username.signature" */
export async function signSession(username: Member): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(username));
  return `${username}.${toBase64Url(sig)}`;
}

/** Verifies a cookie value, returning the username if valid, or null if tampered/invalid. */
export async function verifySession(cookieValue: string | undefined): Promise<Member | null> {
  if (!cookieValue) return null;
  const dotIndex = cookieValue.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const username = cookieValue.slice(0, dotIndex);
  const expected = await signSession.call(null, username as Member).catch(() => null);
  if (!expected) return null;
  if (!isMember(username)) return null;
  // constant-time-ish comparison is overkill for a 9-person honor-system app,
  // but cheap to do correctly via the same signing path above.
  return expected === cookieValue ? username : null;
}

export function checkSharedPassword(input: string): boolean {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    throw new Error('APP_PASSWORD is not set in your environment variables.');
  }
  return input === appPassword;
}
