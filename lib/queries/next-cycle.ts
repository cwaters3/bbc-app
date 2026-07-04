import { db } from '../db';
import { cycles, nominations, pitches } from '../db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';

export async function startNextCycle(currentCycleId: number): Promise<number> {
  // Find the current cycle to get its number
  const [currentCycle] = await db
    .select()
    .from(cycles)
    .where(eq(cycles.id, currentCycleId))
    .limit(1);

  if (!currentCycle || currentCycle.phase !== 'results') {
    throw new Error('Current cycle is not in results phase.');
  }

  // Find 2nd and 3rd place finishers eligible to roll over
  const rollovers = await db
    .select()
    .from(nominations)
    .where(
      and(
        eq(nominations.cycleId, currentCycleId),
        // finalRank 2 or 3, not vetoed, and hasn't used up both rollovers
      )
    );

  const eligible = rollovers.filter(
    (n) =>
      (n.finalRank === 2 || n.finalRank === 3) &&
      n.vetoedBy === null &&
      n.rolloverCount < 2
  );

  // Create the new cycle
  const [newCycle] = await db
    .insert(cycles)
    .values({
      cycleNumber: currentCycle.cycleNumber + 1,
      phase: 'nominating',
    })
    .returning();

  // Port each rollover as a fresh nomination in the new cycle
  for (const nom of eligible) {
    const [newNom] = await db
      .insert(nominations)
      .values({
        cycleId: newCycle.id,
        title: nom.title,
        author: nom.author,
        reviewLink: nom.reviewLink,
        coverUrl: nom.coverUrl,
        rolloverCount: nom.rolloverCount + 1,
        // Points/rank reset — this is a fresh nomination
        finalPoints: null,
        finalRank: null,
        vetoedBy: null,
      })
      .returning();

    // Copy pitches over frozen — attribution preserved for self-vote blocking
    const originalPitches = await db
      .select()
      .from(pitches)
      .where(eq(pitches.nominationId, nom.id));

    if (originalPitches.length > 0) {
      await db.insert(pitches).values(
        originalPitches.map((p) => ({
          nominationId: newNom.id,
          nominator: p.nominator,
          blurb: p.blurb,
        }))
      );
    }
  }

  return newCycle.id;
}
