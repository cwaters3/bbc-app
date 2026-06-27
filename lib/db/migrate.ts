import 'dotenv/config';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './index';

async function main() {
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  console.log('Migrations applied.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
