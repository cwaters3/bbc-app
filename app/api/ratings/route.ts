import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { upsertRating } from '@/lib/queries/history';

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.historyId !== 'number' || typeof body.stars !== 'number') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = await upsertRating(body.historyId, member, body.stars);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
