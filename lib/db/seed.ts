import { config } from 'dotenv';
config({ path: '.env.local' });

async function seed() {
  const { db } = await import('./index');
  const { cycles } = await import('./schema');
  const existing = await db.select().from(cycles).limit(1);
  if (existing.length > 0) {
    console.log('Cycles table already has data — skipping seed.');
    return;
  }

  await db.insert(cycles).values({
    cycleNumber: 1,
    phase: 'nominating',
  });

  console.log('Seeded cycle #1 (nominating phase).');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
