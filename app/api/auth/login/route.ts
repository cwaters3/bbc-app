import { NextRequest, NextResponse } from 'next/server';
import { checkSharedPassword, signSession, SESSION_COOKIE } from '@/lib/auth';
import { isMember } from '@/lib/members';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (typeof username !== 'string' || !isMember(username)) {
    return NextResponse.json({ error: 'Unknown username.' }, { status: 400 });
  }
  if (typeof password !== 'string' || !checkSharedPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const signed = await signSession(username);
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days — low-stakes app, no need to force re-login often
  });
  return response;
}
