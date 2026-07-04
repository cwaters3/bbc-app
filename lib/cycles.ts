import { db } from './db';
import { cycles } from './db/schema';
import { desc, eq } from 'drizzle-orm';
import { computeAndPersistResults } from './queries/results';

export async function getCurrentCycle() {
  const [cycle] = await db.select().from(cycles).orderBy(desc(cycles.id)).limit(1);
  return cycle ?? null;
}

export async function advancePhase(cycleId: number, nextPhase: 'voting' | 'results') {
  const updates: Record<string, unknown> = { phase: nextPhase };
  if (nextPhase === 'voting') updates.votingOpenedAt = new Date();
  if (nextPhase === 'results') updates.resultsAt = new Date();
  await db.update(cycles).set(updates).where(eq(cycles.id, cycleId));

  if (nextPhase === 'results') {
    await computeAndPersistResults(cycleId);
  }
}
