import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { migrate } = await import('drizzle-orm/neon-http/migrator');
  const { db } = await import('./index');
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  console.log('Migrations applied.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
