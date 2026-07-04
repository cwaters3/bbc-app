import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { HOST } from '@/lib/members';
import { getCurrentCycle } from '@/lib/cycles';
import { startNextCycle } from '@/lib/queries/next-cycle';

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (member !== HOST) {
    return NextResponse.json({ error: 'Only the host can start a new cycle.' }, { status: 403 });
  }

  const cycle = await getCurrentCycle();
  if (!cycle || cycle.phase !== 'results') {
    return NextResponse.json(
      { error: 'Can only start a new cycle once the current one is in results.' },
      { status: 400 }
    );
  }

  await startNextCycle(cycle.id);
  return NextResponse.json({ ok: true });
}
