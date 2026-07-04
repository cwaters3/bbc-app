import { db } from '../db';
import { nominations, votes, vetoes, pitches } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { headStart } from './nominations';

type ComputedResult = {
  nominationId: number;
  vetoedBy: string | null;
  points: number; // for a vetoed book, this is the "would've scored" total
  uniqueVoters: number;
  rank: number | null; // null for vetoed or non-placing (4th+)
};

/** Computes final standings for a cycle and persists them onto the
 * nominations table (finalPoints/finalRank/vetoedBy), so results are a
 * snapshot taken the moment voting closes — not recalculated on every
 * page load, which keeps the historical record stable even if, say, the
 * scoring rules change in a later version of the app. */
/** Returns a map of nominationId -> count of distinct voters who put points
 * on it. Used by the Results page to explain *why* a tie was broken the way
 * it was, using real numbers rather than an assumed/hardcoded explanation. */
export async function getUniqueVoterCounts(nominationIds: number[]): Promise<Map<number, number>> {
  if (nominationIds.length === 0) return new Map();
  const rows = await db.select().from(votes).where(inArray(votes.nominationId, nominationIds));
  const map = new Map<number, Set<string>>();
  for (const r of rows) {
    const set = map.get(r.nominationId) ?? new Set<string>();
    set.add(r.voter);
    map.set(r.nominationId, set);
  }
  const counts = new Map<number, number>();
  for (const [id, set] of map) counts.set(id, set.size);
  return counts;
}

export async function computeAndPersistResults(cycleId: number): Promise<void> {
  const noms = await db.select().from(nominations).where(eq(nominations.cycleId, cycleId));
  if (noms.length === 0) return;

  const nomIds = noms.map((n) => n.id);

  const allPitches = await db.select().from(pitches).where(inArray(pitches.nominationId, nomIds));
  const pitchCountByNom = new Map<number, number>();
  for (const p of allPitches) {
    pitchCountByNom.set(p.nominationId, (pitchCountByNom.get(p.nominationId) ?? 0) + 1);
  }

  const allVotes = await db.select().from(votes).where(inArray(votes.nominationId, nomIds));
  const allVetoes = await db.select().from(vetoes).where(inArray(vetoes.nominationId, nomIds));

  const vetoByNom = new Map<number, string>();
  for (const v of allVetoes) {
    if (!vetoByNom.has(v.nominationId)) vetoByNom.set(v.nominationId, v.voter);
  }

  const results: ComputedResult[] = noms.map((n) => {
    const hs = headStart(pitchCountByNom.get(n.id) ?? 1);
    const nomVotes = allVotes.filter((v) => v.nominationId === n.id);
    const votedPoints = nomVotes.reduce((sum, v) => sum + v.points, 0);
    const uniqueVoters = new Set(nomVotes.map((v) => v.voter)).size;
    const vetoedBy = vetoByNom.get(n.id) ?? null;

    return {
      nominationId: n.id,
      vetoedBy,
      points: hs + votedPoints,
      uniqueVoters,
      rank: null, // assigned below
    };
  });

  // Rank only non-vetoed nominations. Tie-break: most unique voters, then earliest submission.
  const submittedAtById = new Map(noms.map((n) => [n.id, n.submittedAt.getTime()]));
  const ranked = results
    .filter((r) => r.vetoedBy === null)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.uniqueVoters !== a.uniqueVoters) return b.uniqueVoters - a.uniqueVoters;
      return (submittedAtById.get(a.nominationId) ?? 0) - (submittedAtById.get(b.nominationId) ?? 0);
    });

  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });

  for (const r of results) {
    await db
      .update(nominations)
      .set({ finalPoints: r.points, finalRank: r.rank, vetoedBy: r.vetoedBy })
      .where(eq(nominations.id, r.nominationId));
  }
}
