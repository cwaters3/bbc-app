# BBC App — Phase 1 (Foundation)

What's in this phase: project scaffold, database schema, and shared-password
auth. No real Nominate/Vote/Results/History pages yet — those are Phases 2-4.
`/demo` (the interactive mock-data version) is already live and needs no setup.

## 1. Replace the repo contents

This whole folder replaces what's currently in your `bbc-app` GitHub repo
(the old single `index.html` mockup file can go — `/demo` below replaces it).

## 2. Add Vercel Postgres

In your Vercel project: **Storage → Create Database → Postgres** (this is
backed by Neon now — Vercel's old `@vercel/postgres` package was deprecated
mid-2025, so this project uses the current `@neondatabase/serverless` driver
instead, which is what Vercel's own docs now point to).

Once created, Vercel auto-adds a `DATABASE_URL` env var to your project. For
local development, run `vercel env pull .env.local` to copy it down, or paste
it manually into `.env.local` (copy `.env.example` to `.env.local` first).

## 3. Set the other two env vars

Still in `.env.local` (and in Vercel's project settings for production):

- `APP_PASSWORD` — whatever shared password the 9 of you will use to log in
- `SESSION_SECRET` — run `openssl rand -hex 32` and paste the result

## 4. Install, migrate, seed

```bash
npm install
npm run db:generate   # generates SQL migration files from lib/db/schema.ts
npm run db:migrate     # applies them to your Postgres database
npm run db:seed        # creates cycle #1 in the "nominating" phase
```

## 5. Run it

```bash
npm run dev
```

Visit `localhost:3000` — you'll get redirected to `/login`. Pick your
username, enter the shared password, and you'll land on a placeholder home
page confirming the session works. `localhost:3000/demo` works immediately,
no login needed.

## 6. Deploy

Push to `main` — Vercel will pick it up automatically the same way it did
for the static mockup.

---

**What's real vs. placeholder right now:** auth and the database schema are
fully real. The home page after logging in is just a checkpoint screen — it
doesn't show nominations or let you vote yet. That's Phase 2.
