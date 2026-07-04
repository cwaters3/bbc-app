import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { submitNomination } from '@/lib/queries/nominations';

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }

  const cycle = await getCurrentCycle();
  if (!cycle || cycle.phase !== 'nominating') {
    return NextResponse.json({ error: 'Nomination week is not currently open.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = await submitNomination({
    cycleId: cycle.id,
    nominator: member,
    title: body.title ?? '',
    author: body.author ?? '',
    blurb: body.blurb ?? '',
    reviewLink: body.reviewLink,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
