import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { db } = await import('./index');
  const { nominations } = await import('./schema');
  const { isNull, eq } = await import('drizzle-orm');
  const { lookupCoverUrl } = await import('../coverArt');

  const missing = await db.select().from(nominations).where(isNull(nominations.coverUrl));

  if (missing.length === 0) {
    console.log('Every nomination already has cover art — nothing to backfill.');
    return;
  }

  console.log(`Found ${missing.length} nomination(s) missing cover art. Looking them up...`);

  for (const n of missing) {
    const coverUrl = await lookupCoverUrl(n.title, n.author);
    if (coverUrl) {
      await db.update(nominations).set({ coverUrl }).where(eq(nominations.id, n.id));
      console.log(`  ✓ ${n.title} — found cover.`);
    } else {
      console.log(`  ✗ ${n.title} — still no match on either source.`);
    }
  }

  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
