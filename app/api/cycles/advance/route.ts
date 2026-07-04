import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/session';
import { HOST } from '@/lib/members';
import { getCurrentCycle, advancePhase } from '@/lib/cycles';

export async function POST() {
  const member = await getCurrentMember();
  if (member !== HOST) {
    return NextResponse.json({ error: 'Only the host can do that.' }, { status: 403 });
  }

  const cycle = await getCurrentCycle();
  if (!cycle) {
    return NextResponse.json({ error: 'No active cycle.' }, { status: 400 });
  }

  if (cycle.phase === 'nominating') {
    await advancePhase(cycle.id, 'voting');
    return NextResponse.json({ ok: true, newPhase: 'voting' });
  }
  if (cycle.phase === 'voting') {
    await advancePhase(cycle.id, 'results');
    return NextResponse.json({ ok: true, newPhase: 'results' });
  }
  return NextResponse.json({ error: 'Cycle is already at results.' }, { status: 400 });
}
