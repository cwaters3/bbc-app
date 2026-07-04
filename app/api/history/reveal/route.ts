import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { HOST } from '@/lib/members';
import { revealRatings } from '@/lib/queries/history';

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (member !== HOST) {
    return NextResponse.json({ error: 'Only the host can reveal ratings.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.historyId !== 'number') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  await revealRatings(body.historyId);
  return NextResponse.json({ ok: true });
}
