import { db } from '../db';
import { history, ratings, nominations, pitches, cycles } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import type { Member } from '../members';

export type HistoryEntry = {
  id: number;
  cycleId: number;
  dateRead: Date;
  revealed: boolean;
  nomination: {
    id: number;
    title: string;
    author: string;
    coverUrl: string | null;
    reviewLink: string | null;
    finalPoints: number | null;
    nominators: string[];
  };
  overallRating: number | null; // null if not yet revealed or no ratings submitted
  myRating: number | null;
  ratingCount: number;
};

export async function getHistory(
  member: Member,
  sortBy: 'date' | 'rating' = 'date'
): Promise<HistoryEntry[]> {
  const entries = await db.select().from(history).orderBy(desc(history.dateRead));
  if (entries.length === 0) return [];

  const nomIds = entries.map((e) => e.nominationId);
  const noms = await db.select().from(nominations);
  const allPitches = await db.select().from(pitches);
  const allRatings = await db.select().from(ratings);

  const nomById = new Map(noms.map((n) => [n.id, n]));
  const pitchesByNom = new Map<number, typeof allPitches>();
  for (const p of allPitches) {
    const list = pitchesByNom.get(p.nominationId) ?? [];
    list.push(p);
    pitchesByNom.set(p.nominationId, list);
  }
  const ratingsByHistory = new Map<number, typeof allRatings>();
  for (const r of allRatings) {
    const list = ratingsByHistory.get(r.historyId) ?? [];
    list.push(r);
    ratingsByHistory.set(r.historyId, list);
  }

  const result: HistoryEntry[] = entries.map((e) => {
    const nom = nomById.get(e.nominationId)!;
    const nominators = (pitchesByNom.get(e.nominationId) ?? []).map((p) => p.nominator);
    const entryRatings = ratingsByHistory.get(e.id) ?? [];
    const myRating = entryRatings.find((r) => r.member === member)?.stars ?? null;
    const avg =
      entryRatings.length > 0
        ? entryRatings.reduce((sum, r) => sum + r.stars, 0) / entryRatings.length
        : null;
    // Round to nearest 0.5 for display
    const overallRating = avg !== null ? Math.round(avg * 2) / 2 : null;

    return {
      id: e.id,
      cycleId: e.cycleId,
      dateRead: e.dateRead,
      revealed: e.revealed,
      nomination: {
        id: nom.id,
        title: nom.title,
        author: nom.author,
        coverUrl: nom.coverUrl,
        reviewLink: nom.reviewLink,
        finalPoints: nom.finalPoints,
        nominators,
      },
      overallRating: e.revealed ? overallRating : null,
      myRating,
      ratingCount: entryRatings.length,
    };
  });

  if (sortBy === 'rating') {
    return result.sort((a, b) => {
      if (a.overallRating === null && b.overallRating === null) return 0;
      if (a.overallRating === null) return 1;
      if (b.overallRating === null) return -1;
      return b.overallRating - a.overallRating;
    });
  }

  return result;
}

export async function upsertRating(
  historyId: number,
  member: Member,
  stars: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (stars < 0.5 || stars > 5 || Math.round(stars * 2) !== stars * 2) {
    return { ok: false, error: 'Invalid star value — must be 0.5–5 in half-star increments.' };
  }

  // Verify the history entry exists and ratings are revealed before allowing submission
  const [entry] = await db.select().from(history).where(eq(history.id, historyId)).limit(1);
  if (!entry) return { ok: false, error: 'History entry not found.' };
  if (!entry.revealed) return { ok: false, error: 'Ratings are not yet revealed for this book.' };

  await db
    .insert(ratings)
    .values({ historyId, member, stars, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [ratings.historyId, ratings.member],
      set: { stars, updatedAt: new Date() },
    });

  return { ok: true };
}

export async function revealRatings(historyId: number): Promise<void> {
  await db.update(history).set({ revealed: true }).where(eq(history.id, historyId));
}
