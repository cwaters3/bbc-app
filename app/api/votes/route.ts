import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { getNominationsForCycle } from '@/lib/queries/nominations';
import { submitVote } from '@/lib/queries/votes';

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }

  const cycle = await getCurrentCycle();
  if (!cycle || cycle.phase !== 'voting') {
    return NextResponse.json({ error: 'Voting is not currently open.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const nominations = await getNominationsForCycle(cycle.id);

  const result = await submitVote(
    {
      cycleId: cycle.id,
      voter: member,
      points: body.points ?? {},
      vetoNominationId: body.vetoNominationId ?? null,
    },
    nominations
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
