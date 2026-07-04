import { db } from '../db';
import { nominations, pitches } from '../db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { lookupCoverUrl } from '../coverArt';
import type { Member } from '../members';

export async function getNominationsForCycle(cycleId: number) {
  const noms = await db
    .select()
    .from(nominations)
    .where(eq(nominations.cycleId, cycleId))
    .orderBy(nominations.submittedAt);

  const allPitches = await db.select().from(pitches);
  const pitchesByNomination = new Map<number, typeof allPitches>();
  for (const p of allPitches) {
    const list = pitchesByNomination.get(p.nominationId) ?? [];
    list.push(p);
    pitchesByNomination.set(p.nominationId, list);
  }

  return noms.map((n) => ({
    ...n,
    pitches: (pitchesByNomination.get(n.id) ?? []).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    ),
  }));
}

/** 0 for a single pitch, 2 for a double-nomination, 3 for a triple+ (capped). */
export function headStart(pitchCount: number): number {
  if (pitchCount >= 3) return 3;
  if (pitchCount === 2) return 2;
  return 0;
}

/** Has this member already used their one nomination slot this cycle? */
export async function hasAlreadyNominated(cycleId: number, member: Member): Promise<boolean> {
  const [existing] = await db
    .select({ id: pitches.id })
    .from(pitches)
    .innerJoin(nominations, eq(pitches.nominationId, nominations.id))
    .where(and(eq(nominations.cycleId, cycleId), eq(pitches.nominator, member)))
    .limit(1);
  return !!existing;
}

async function findMatchingNomination(cycleId: number, title: string, author: string) {
  const [match] = await db
    .select()
    .from(nominations)
    .where(
      and(
        eq(nominations.cycleId, cycleId),
        ilike(nominations.title, title.trim()),
        ilike(nominations.author, author.trim())
      )
    )
    .limit(1);
  return match ?? null;
}

export type SubmitNominationInput = {
  cycleId: number;
  nominator: Member;
  title: string;
  author: string;
  blurb: string;
  reviewLink?: string;
};

export type SubmitNominationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitNomination(
  input: SubmitNominationInput
): Promise<SubmitNominationResult> {
  const title = input.title.trim();
  const author = input.author.trim();
  const blurb = input.blurb.trim();

  if (!title || !author || !blurb) {
    return { ok: false, error: 'Title, author, and a blurb are all required.' };
  }

  const already = await hasAlreadyNominated(input.cycleId, input.nominator);
  if (already) {
    return { ok: false, error: "You've already used your nomination for this cycle." };
  }

  const existing = await findMatchingNomination(input.cycleId, title, author);

  if (existing) {
    return {
      ok: false,
      error: 'This book was already nominated this cycle — choose a different one, or wait to vote for it when voting opens.',
    };
  }

  const coverUrl = await lookupCoverUrl(title, author);

  const [created] = await db
    .insert(nominations)
    .values({
      cycleId: input.cycleId,
      title,
      author,
      reviewLink: input.reviewLink?.trim() || null,
      coverUrl,
    })
    .returning();

  await db.insert(pitches).values({
    nominationId: created.id,
    nominator: input.nominator,
    blurb,
  });

  return { ok: true };
}
