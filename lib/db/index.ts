import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it in your Vercel project (Storage → Postgres) or in .env.local for local dev.'
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
