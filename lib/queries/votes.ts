import { db } from '../db';
import { votes, vetoes } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { Member } from '../members';
import type { getNominationsForCycle } from './nominations';

type Nomination = Awaited<ReturnType<typeof getNominationsForCycle>>[number];

export async function getVoteState(cycleId: number, member: Member) {
  const myVotes = await db
    .select()
    .from(votes)
    .where(and(eq(votes.cycleId, cycleId), eq(votes.voter, member)));
  const [myVeto] = await db
    .select()
    .from(vetoes)
    .where(and(eq(vetoes.cycleId, cycleId), eq(vetoes.voter, member)));

  const points: Record<number, number> = {};
  for (const v of myVotes) points[v.nominationId] = v.points;

  return { points, vetoNominationId: myVeto?.nominationId ?? null };
}

export type SubmitVoteInput = {
  cycleId: number;
  voter: Member;
  points: Record<number, number>;
  vetoNominationId: number | null;
};

export type SubmitVoteResult = { ok: true } | { ok: false; error: string };

export async function submitVote(
  input: SubmitVoteInput,
  nominationsInCycle: Nomination[]
): Promise<SubmitVoteResult> {
  const { cycleId, voter, points, vetoNominationId } = input;

  const ownNominationIds = new Set(
    nominationsInCycle
      .filter((n) => n.pitches.some((p) => p.nominator === voter))
      .map((n) => n.id)
  );

  if (vetoNominationId !== null) {
    if (Object.keys(points).length > 0) {
      return { ok: false, error: "Can't use a veto and distribute points in the same vote." };
    }
    if (ownNominationIds.has(vetoNominationId)) {
      return { ok: false, error: "You can't veto your own nomination." };
    }
  } else {
    const entries = Object.entries(points);
    let total = 0;
    for (const [nomIdStr, pts] of entries) {
      const nomId = Number(nomIdStr);
      if (!Number.isInteger(pts) || pts < 0) {
        return { ok: false, error: 'Invalid point value.' };
      }
      if (pts > 0 && ownNominationIds.has(nomId)) {
        return { ok: false, error: "You can't vote on your own nomination." };
      }
      total += pts;
    }
    if (total > 3) {
      return { ok: false, error: "You only have 3 points to distribute." };
    }
  }

  // Replace semantics — wipe this voter's prior vote/veto for the cycle, then write the new one.
  await db.delete(votes).where(and(eq(votes.cycleId, cycleId), eq(votes.voter, voter)));
  await db.delete(vetoes).where(and(eq(vetoes.cycleId, cycleId), eq(vetoes.voter, voter)));

  if (vetoNominationId !== null) {
    await db.insert(vetoes).values({ cycleId, voter, nominationId: vetoNominationId });
  } else {
    const rows = Object.entries(points)
      .filter(([, pts]) => pts > 0)
      .map(([nomId, pts]) => ({ cycleId, voter, nominationId: Number(nomId), points: pts }));
    if (rows.length > 0) {
      await db.insert(votes).values(rows);
    }
  }

  return { ok: true };
}
