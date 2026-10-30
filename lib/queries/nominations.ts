import { db } from '../db';
import { nominations, pitches } from '../db/schema';
import { eq, and, ne, ilike } from 'drizzle-orm';
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

/**
 * Has this member already used their one nomination slot this cycle?
 * Rollover nominations (rolloverCount > 0) carry their original pitch
 * forward automatically so self-vote blocking still works — that copied
 * pitch must NOT count as this member using their nomination slot this
 * cycle, or a member with a rollover book can never submit a new pitch.
 */
export async function hasAlreadyNominated(cycleId: number, member: Member): Promise<boolean> {
  const [existing] = await db
    .select({ id: pitches.id })
    .from(pitches)
    .innerJoin(nominations, eq(pitches.nominationId, nominations.id))
    .where(
      and(
        eq(nominations.cycleId, cycleId),
        eq(pitches.nominator, member),
        eq(nominations.rolloverCount, 0)
      )
    )
    .limit(1);
  return !!existing;
}

/**
 * The member's own fresh nomination for this cycle (rollovers excluded, same
 * rule as hasAlreadyNominated), or null if they haven't nominated yet. Used by
 * the Nominate page for the post-submission status card, and by
 * submitNomination to know what a "change my nomination" should replace.
 */
export async function getMyNomination(cycleId: number, member: Member) {
  const [row] = await db
    .select({
      nominationId: nominations.id,
      pitchId: pitches.id,
      title: nominations.title,
      author: nominations.author,
      reviewLink: nominations.reviewLink,
      blurb: pitches.blurb,
    })
    .from(pitches)
    .innerJoin(nominations, eq(pitches.nominationId, nominations.id))
    .where(
      and(
        eq(nominations.cycleId, cycleId),
        eq(pitches.nominator, member),
        eq(nominations.rolloverCount, 0)
      )
    )
    .limit(1);
  return row ?? null;
}

async function findMatchingNomination(
  cycleId: number,
  title: string,
  author: string,
  excludeNominationId?: number
) {
  const [match] = await db
    .select()
    .from(nominations)
    .where(
      and(
        eq(nominations.cycleId, cycleId),
        ilike(nominations.title, title.trim()),
        ilike(nominations.author, author.trim()),
        excludeNominationId !== undefined ? ne(nominations.id, excludeNominationId) : undefined
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
  /** When true, swap out the member's existing nomination for this one instead of
   * declining with "already used your nomination". */
  replace?: boolean;
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

  const mine = await getMyNomination(input.cycleId, input.nominator);

  if (mine && !input.replace) {
    return { ok: false, error: "You've already used your nomination for this cycle." };
  }

  // When replacing, the member's own current pick is excluded from the duplicate
  // check so they can resubmit the same book with a different blurb.
  const existing = await findMatchingNomination(input.cycleId, title, author, mine?.nominationId);

  if (existing) {
    return {
      ok: false,
      error: 'This book was already nominated this cycle — choose a different one, or wait to vote for it when voting opens.',
    };
  }

  const coverUrl = await lookupCoverUrl(title, author);

  // Insert the new nomination first, then remove the old one — if anything fails
  // midway the member is left with an extra row rather than no nomination at all.
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

  if (mine) {
    await db.delete(pitches).where(eq(pitches.id, mine.pitchId));

    // The nomination row itself only goes away if nobody else pitched the same book.
    const [stillPitched] = await db
      .select({ id: pitches.id })
      .from(pitches)
      .where(eq(pitches.nominationId, mine.nominationId))
      .limit(1);
    if (!stillPitched) {
      await db.delete(nominations).where(eq(nominations.id, mine.nominationId));
    }
  }

  return { ok: true };
}
