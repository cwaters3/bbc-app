# BBC App — Living Reference Document

*The Boys Book Club · Internal tool · Last updated: August 2026*

---

## What This App Does

A private web app for a 9-member offline book club that meets every 6 weeks. It manages a structured nomination and voting cycle:

1. **Nomination week (1 week):** Members nominate a book they haven't read. One nomination per member per cycle. Submissions stay hidden — only a running counter is shown. Rollovers from the previous cycle (2nd/3rd place) are visible immediately and don't consume a member's nomination slot.  
2. **Voting week (1 week):** All nominations reveal at once ("ta-da"). Each member gets 3 points to distribute freely, or can use one veto to instantly eliminate a book (forfeiting their own points that cycle). Members can't vote on their own nomination.  
3. **Results:** Highest points wins. Ties broken by: most unique voters → earliest submission timestamp. Only the winner's nominator(s) are revealed. Vetoed books show who vetoed and their would-have-been score. 2nd and 3rd place roll over to the next cycle (points reset, content frozen, up to twice).  
4. **History:** Past reads with star ratings (1–5, half-star increments). BBC Overall rating is gated behind a host "reveal" after the meeting — the ta-da moment. Members can rate any time after results are revealed, independent of the reveal gate.

---

## Rules Summary

- **Members:** 9 fixed usernames (see below). Shared app password. No real user accounts, no per-member DB rows.  
- **Host:** `cwaters` — only member who can advance phases, start the next cycle, or reveal ratings.  
- **Nominations:** One per member per cycle. Duplicate book titles → declined with an inline error (choose something else or wait to vote). Rollover nominations do NOT count against a member's nomination slot (see Known Bugs Fixed below — this was broken until Aug 2026). No read-history enforcement — honor system.  
- **Voting:** 3 points OR one veto, never both. No self-voting (server-enforced). Always editable until host closes voting.  
- **Tie-break:** Most unique voters → earliest submission timestamp. The Results page explanation is built from real computed numbers (`getUniqueVoterCounts`), not a hardcoded/assumed message.  
- **Rollover:** 2nd and 3rd place roll over up to 2 times (3 total cycles) before needing fresh renomination. Vetoed books never roll over. Rollover nominations carry their original `pitches` row forward (same nominator, same blurb) so self-vote blocking stays correct.  
- **Single nomination:** If only 1 book nominated → selected by default, no vote held. Snarky message displayed.  
- **Zero nominations \+ zero rollovers:** Nomination week auto-extends. Mor'gathuul the Atrocious, God of Vorlathiss, is invoked.  
- **Ratings:** Editable any time after Results phase, regardless of reveal state. BBC Overall \= average of all member ratings, rounded to nearest 0.5. Revealed by host after the meeting via a per-history-entry `revealed` flag.

---

## Members

| Username | Role |
| :---- | :---- |
| `cwaters` | Host (admin) |
| `btaylor` | Member |
| `kjutkiewicz` | Member |
| `wrose` | Member |
| `asegoshi` | Member |
| `aadvani` | Member |
| `msebela` | Member |
| `dweimer` | Member |
| `tcourneen` | Member |

Defined in `lib/members.ts` as a fixed array \+ `HOST` constant — not a DB table.

---

## Tech Stack

| Layer | Technology |
| :---- | :---- |
| Framework | Next.js 14 (App Router, Server Components) |
| Hosting | Vercel (auto-deploy from GitHub on push) |
| Database | Neon Postgres |
| ORM | Drizzle ORM (`@neondatabase/serverless` driver) |
| Auth | Shared app password \+ HMAC-signed cookie (Web Crypto API, Edge-compatible) |
| Fonts | Lobster (club name display), Inter (UI text) |
| Styling | Tailwind CSS |
| Version control | GitHub (`cwaters3/bbc-app`), commits/pushes via GitHub Desktop |

**Color palette:**

- Primary (moss): `#5C7A5C` / `#4A6449`  
- Secondary (apricot): `#E0A878` / `#C98C5C`  
- Danger (veto/error): `#C1554A`  
- Background: `#FAF9F6`

**Design philosophy:** Data-as-hero, light and airy, mobile-first. Color used for hierarchy, not decoration. Clean fintech aesthetic rather than playful/cozy. Bottom tab navigation, card-based layouts with soft drop shadows.

---

## Live URLs

- **Production app:** `https://bbc-app-jet.vercel.app`  
- **Demo (no auth, fictional club, mock data):** `https://bbc-app-jet.vercel.app/demo`  
- **GitHub Pages mockup (legacy, superseded):** `https://cwaters3.github.io/bbc-app/`

---

## Environment Variables

| Variable | Where set | Notes |
| :---- | :---- | :---- |
| `DATABASE_URL` | Vercel (Production scope) \+ `.env.local` | **Set manually, not via the Neon/Vercel integration.** See Known Gotchas below — the integration's auto-synced var stays empty even after email verification. Real connection string comes from Neon's "Connect" panel. |
| `APP_PASSWORD` | Vercel \+ `.env.local` | Shared club password |
| `SESSION_SECRET` | Vercel \+ `.env.local` | Random hex string for HMAC cookie signing |

There is **no separate test environment** — the same Neon database serves both local dev and production. Running the app locally reads/writes real club data. Testing cadence relies on terminal output, browser checks, and direct SQL in the Neon query editor rather than a sandboxed DB.

---

## Database Schema

Defined in `lib/db/schema.ts` (Drizzle table definitions):

cycles       — id, cycleNumber, phase ('nominating'|'voting'|'results'),

               nominationOpenedAt, votingOpenedAt, resultsAt, meetingDate

nominations  — id, cycleId → cycles.id, title, author, reviewLink, coverUrl,

               submittedAt, rolloverCount (0 \= new this cycle), finalPoints,

               finalRank (null if 4th+ or vetoed), vetoedBy (username or null)

pitches      — id, nominationId → nominations.id, nominator (username),

               blurb, createdAt

               // One row per person who nominated a book. The merge/

               // double-nomination mechanic was removed — current model

               // is effectively one pitch per nomination, but the table

               // shape (many pitches → one nomination) is retained.

votes        — cycleId, voter, nominationId, points (1–3)

               // composite PK (cycleId, voter, nominationId); no row \= no points given

vetoes       — cycleId, voter, nominationId

               // composite PK (cycleId, voter) — enforces one veto per member per cycle

history      — id, nominationId → nominations.id, cycleId → cycles.id,

               dateRead, revealed (bool, default false)

ratings      — historyId → history.id, member, stars (0.5 increments, 1–5), updatedAt

               // composite PK (historyId, member) — always editable, not gated by \`revealed\`

**Key design decisions:**

- Results are computed once and persisted (`finalPoints`/`finalRank`/`vetoedBy` on `nominations`) rather than recalculated live on every page load.  
- `pitches` is the many-side of `nominations` specifically so self-vote blocking and nominator attribution can be checked via a join, independent of how many people pitched a given title.  
- `revealed` on `history` gates only the BBC Overall average, never a member's own rating input — this was a real bug (see below) and is now enforced correctly in both `upsertRating` and the History page UI.  
- `rolloverCount` on `nominations` is what distinguishes "fresh nomination this cycle" from "carried-forward pitch" — this field is load-bearing for the nomination-slot check (see Known Bugs Fixed).

---

## Architecture & Key Patterns

*This section exists so a new session (human or Claude) can navigate the codebase without re-deriving intent from scratch.*

### Auth

- `middleware.ts` gates all routes except `/login` and `/demo/*`.  
- `lib/auth.ts` — password check against `APP_PASSWORD`, cookie sign/verify via Web Crypto HMAC (chosen for Edge runtime compatibility, since Vercel Edge middleware can't use Node's `crypto` module).  
- `lib/session.ts` — `getCurrentMember()` reads the verified cookie in Server Components/Route Handlers. Middleware guarantees a valid session exists on protected routes, but pages still need to know *who*, for attribution.

### Phase lifecycle

- `lib/cycles.ts` — `getCurrentCycle()` fetches the active cycle; `advancePhase()` is host-only and triggers `computeAndPersistResults()` when moving from `voting` → `results`.  
- `lib/queries/next-cycle.ts` — `startNextCycle()`: host-only, gated on `phase === 'results'`. Computes eligible rollovers (2nd/3rd place, not vetoed, `rolloverCount < 2`), creates a new `cycles` row (`phase: 'nominating'`), and copies forward `nominations` \+ their original `pitches` row for each rollover book. Exposed via `POST /api/cycles/next`, triggered by the host-only "Start next cycle" button on the Results page.

### Nomination logic (`lib/queries/nominations.ts`)

- `hasAlreadyNominated(cycleId, member)` — the one-nomination-per-cycle check. **Must** filter to `rolloverCount === 0` nominations only, or a member with a rollover book gets permanently blocked from submitting a fresh nomination (this was a real bug, fixed Aug 2026 — see below).  
- `findMatchingNomination(cycleId, title, author)` — duplicate-title check, intentionally NOT scoped by rollover status, since a rollover book showing up as a "new" pitch should still be declined.  
- `submitNomination()` — validates fields, checks both of the above, does cover art lookup, inserts `nominations` \+ `pitches` rows.

### Voting & results (`lib/queries/results.ts`, `app/vote/*`)

- Self-vote blocking is app-layer: `submitVote` compares `voter` against the nomination's `pitches.nominator`. This persists even after a nominator field is corrected via direct SQL — worth remembering if historical data gets patched (see Known Gotchas).  
- `getUniqueVoterCounts()` — returns a `nominationId → distinct voter count` map, used to build an honest tie-break explanation on the Results page from real numbers rather than an assumed message.  
- `computeAndPersistResults()` — runs once on phase advance to `results`; also auto-creates the corresponding `history` row for the winner (previously this was done manually via SQL — fixed so it's automatic going forward).

### Ratings & History (`lib/queries/history.ts`)

- `upsertRating()` — a member's own rating is always writable regardless of `revealed`; only the BBC Overall average display is gated behind it. (Was previously buggy — both were gated together.)  
- `revealRatings()` — host-only, flips `revealed` on a `history` row.  
- `getHistoryIdForCycle()`, `getMyRating()` — helpers added to support the Results page's "Your rating" star input, so a member can rate the winner immediately without navigating to History.

### Shared UI patterns

- `app/empty-state.tsx` — `EmptyState` component for full-page, phase-gated messaging (e.g. "Nomination week is closed"). Phase-aware: the CTA and copy branch on whether the cycle is currently in `voting` or `results`, not a single hardcoded "head to Vote" message.  
- `app/rules/content.tsx` — single source of truth for rule copy, consumed by the Rules page (accordion UI) and anywhere else rules text needs to appear, so copy never drifts out of sync across surfaces.  
- `app/stars.tsx` — `RatingDisplay` (read-only) and `RatingInput` (interactive) star components. Both rating rows (BBC Overall, Your Rating) are ordered so the label is left-aligned and the stars/number are right-aligned consistently, regardless of whether a numeric score is also shown.  
- `TopNav` (`app/top-nav.tsx`) — shared tab nav \+ "Chapter N" label. Takes an optional `basePath` prop so the same component can route to `/demo/*` links instead of real routes.

### Cover art (`lib/coverArt.ts`)

- Dual-source lookup: Open Library first, Google Books as fallback. Silent catch blocks were replaced with real error logging.  
- `npm run db:backfill-covers` — scans for `nominations` missing `coverUrl` and re-runs the lookup chain. Useful when a title has no Open Library index entry (happened with "The Dimensions of a Cave").

### `/demo` route

- Fictional club ("Chapter & Verse") with a separate roster and fixture data, publicly accessible with no auth.  
- Architecture: reuses the *real* presentational components (`NominationForm`, `VoteForm`, `ResultsView`, `RulesAccordion`, `Cover`, `RatingInput`) with optional injected handlers (`onSubmit`, `onRate` props) so demo interactions update local browser state instead of hitting real API routes — same component and styling, different wire-up underneath. This is what keeps the demo permanently visually in sync with the real app.  
- A `resetKey` counter pattern forces remount of stateful child components when the "↺ Reset demo" button is clicked.  
- Demo cover art is resolved client-side via `lib/demo/useDemoCovers.ts`, calling a same-origin `/api/demo/cover` route (which wraps the same `lookupCoverUrl` used by the real app) — avoids CORS issues from calling Open Library/Google Books directly from the browser, and lets pages render instantly with placeholders while covers fill in.  
- `ResultsView` is a shared component so the real Results page and the demo Results page render identically rather than being two maintained copies.

---

## File Map

bbc-app/

├── middleware.ts                    — Auth gate; /login and /demo/\* are public

├── lib/

│   ├── auth.ts                      — Password check, HMAC cookie sign/verify

│   ├── members.ts                   — Fixed roster of 9 \+ HOST constant

│   ├── session.ts                   — getCurrentMember() for server components

│   ├── cycles.ts                    — getCurrentCycle(), advancePhase()

│   ├── coverArt.ts                  — Dual-source cover lookup (Open Library → Google Books)

│   ├── db/

│   │   ├── index.ts                 — Drizzle client

│   │   ├── schema.ts                — Full table definitions

│   │   ├── migrate.ts               — Migration runner (dynamic dotenv import — don't change)

│   │   ├── seed.ts                  — Creates cycle \#1 (dynamic dotenv import — don't change)

│   │   └── backfill-covers.ts       — Backing script for \`npm run db:backfill-covers\`

│   ├── demo/

│   │   ├── fixtures.ts              — Fictional "Chapter & Verse" roster \+ mock data

│   │   └── useDemoCovers.ts         — Client-side hook resolving demo cover art via /api/demo/cover

│   └── queries/

│       ├── nominations.ts           — submitNomination, hasAlreadyNominated,

│       │                              findMatchingNomination, getNominationsForCycle, headStart()

│       ├── votes.ts                 — Fetch vote state, submit/replace vote, self-vote blocking

│       ├── results.ts               — computeAndPersistResults(), getUniqueVoterCounts()

│       ├── history.ts               — getHistory, upsertRating(), revealRatings(),

│       │                              getHistoryIdForCycle(), getMyRating()

│       └── next-cycle.ts            — startNextCycle() — rollover eligibility \+ new cycle creation

├── app/

│   ├── layout.tsx                   — Root layout, fonts

│   ├── globals.css                  — Tailwind entry

│   ├── page.tsx                     — Nominate page (/)

│   ├── top-nav.tsx                  — Shared tab nav \+ Chapter N label; basePath prop for demo

│   ├── cover.tsx                    — Book cover image component

│   ├── stars.tsx                    — RatingDisplay \+ RatingInput components

│   ├── empty-state.tsx              — EmptyState — full-page phase-gated messaging

│   ├── logout-button.tsx            — Log out client component

│   ├── nomination-form.tsx          — Nomination submission form (real \+ demo, injectable onSubmit)

│   ├── vote-form.tsx                — Interactive points/veto form (real \+ demo) — lives at app root, not inside vote/

│   ├── host-advance-button.tsx      — Close nominations / Close voting

│   ├── start-next-cycle-button.tsx  — Start next cycle (host only)

│   ├── login-page.tsx               — ⚠️ Unconfirmed/stray file at app root, separate from login/page.tsx — check if dead code

│   ├── login/page.tsx               — Login page (links to /demo)

│   ├── vote/page.tsx                — Vote page (/vote)

│   ├── results/

│   │   ├── page.tsx                 — Results page (/results)

│   │   └── results-view.tsx         — ResultsView — shared between real \+ demo

│   ├── history/

│   │   ├── page.tsx                 — History page (/history); no "everything we've read" banner

│   │   ├── sort-toggle.tsx          — Date/rating sort toggle

│   │   └── reveal-button.tsx        — Host-only reveal ratings button

│   ├── rules/

│   │   ├── page.tsx                 — Rules page (/rules) — collapsible accordion

│   │   ├── content.tsx              — Shared rule copy, single source of truth

│   │   └── accordion.tsx            — Accordion UI, shared between real \+ demo

│   ├── demo/

│   │   ├── page.tsx                 — Demo Nominate

│   │   ├── vote/page.tsx            — Demo Vote

│   │   ├── results/page.tsx         — Demo Results

│   │   ├── history/page.tsx         — Demo History

│   │   └── rules/page.tsx           — Demo Rules

│   └── api/

│       ├── auth/login/route.ts      — POST /api/auth/login

│       ├── auth/logout/route.ts     — POST /api/auth/logout

│       ├── nominations/route.ts     — POST /api/nominations

│       ├── votes/route.ts           — POST /api/votes

│       ├── cycles/advance/route.ts  — POST /api/cycles/advance (host only)

│       ├── cycles/next/route.ts     — POST /api/cycles/next (host only)

│       ├── ratings/route.ts         — POST /api/ratings

│       ├── history/reveal/route.ts  — POST /api/history/reveal (host only)

│       └── demo/cover/route.ts      — GET same-origin cover proxy for demo pages

└── public/

Confirmed against `ls -R app/` and `ls -R lib/` output (Aug 2026\) — the structure above reflects the real repo, not a reconstruction.

---

## Local Dev Setup

\# Install dependencies

npm install

\# Pull real env vars (DATABASE\_URL may come through empty — see Known Gotchas)

vercel env pull .env.local \--environment=production

\# Run dev server

npm run dev

\# → http://localhost:3000

**Database scripts (only needed when schema changes):**

npm run db:generate         \# Generate SQL migration from schema.ts

npm run db:migrate          \# Apply migrations to the real Neon database

npm run db:seed             \# Create cycle \#1 (only if cycles table is empty)

npm run db:backfill-covers  \# Re-run cover art lookup for nominations missing coverUrl

**Important:** since local dev and production share one Neon database, running the dev server locally reads and writes real club data — there is no isolated sandbox to test destructive changes against.

---

## Current Real Data

- **Cycle \#1 (Chapter 1):** Complete. Winner: Dungeon Crawler Carl (Matt Dinniman), nominated by btaylor, read June 2026\.  
- **Cycle \#2 (Chapter 2):** Complete. Phase \= results.  
  - Winner: The Dimensions of a Cave (Greg Jackson), nominated by dweimer — ratings not yet revealed.  
  - 2nd: Rejection (Tony Tulathimutte), nominated by kjutkiewicz — rolled over to Chapter 3\.  
  - 3rd: The Colour of Magic (Terry Pratchett), nominated by wrose — rolled over to Chapter 3 (nominator attribution corrected Aug 2026, see below).  
  - 4th: The Bee Sting (Paul Murray), nominated by aadvani (nominator attribution corrected Aug 2026).  
  - Also nominated: Carl's Doomsday Scenario (Matt Dinniman), nominated by cwaters — no final rank recorded.  
- **Cycle \#3 (Chapter 3):** Active. Phase \= nominating. Rollovers in play: Rejection and The Colour of Magic (both rollover 1/2).

---

## Useful Queries

Run these directly in the Neon SQL editor. Swap `cycle_id` / username values as needed.

**All nominations \+ pitches for a given cycle:**

SELECT

  n.id AS nomination\_id,

  n.title,

  n.author,

  n.rollover\_count,

  n.final\_rank,

  n.vetoed\_by,

  p.nominator,

  p.created\_at AS pitch\_created\_at

FROM nominations n

JOIN pitches p ON p.nomination\_id \= n.id

WHERE n.cycle\_id \= 3  \-- change to the cycle you want

ORDER BY p.created\_at ASC;

**Everything a specific member has nominated, across all cycles** (useful for tracing attribution bugs or rollover confusion):

SELECT

  n.id AS nomination\_id,

  n.title,

  n.author,

  n.rollover\_count,

  n.cycle\_id,

  c.cycle\_number,

  c.phase,

  p.id AS pitch\_id,

  p.nominator,

  p.created\_at AS pitch\_created\_at

FROM pitches p

JOIN nominations n ON p.nomination\_id \= n.id

JOIN cycles c ON n.cycle\_id \= c.id

WHERE p.nominator \= 'aadvani'  \-- change to the member you want

ORDER BY c.cycle\_number DESC, p.created\_at DESC;

**Fix a mis-attributed nominator** (target by `nomination_id` or `pitch_id`, whichever is more specific):

UPDATE pitches SET nominator \= 'correct\_username' WHERE nomination\_id \= 9;

\-- or, to target a single pitch row directly (e.g. a rollover copy):

UPDATE pitches SET nominator \= 'correct\_username' WHERE id \= 14;

---

## Known Gotchas & Learnings

- **Neon/Vercel integration env var issue (RESOLVED — don't relitigate):** The integration's auto-synced vars (`DATABASE_URL`, `POSTGRES_URL`, etc.) stay empty even after email verification; reconnecting doesn't fix it. Fix: delete the integration-managed `DATABASE_URL` and manually add a plain `DATABASE_URL` in Vercel (Production scope) with the real Neon connection string from Neon's Connect panel. Same string in `.env.local` locally. If DB/env setup is touched again, go straight to manual.  
- **dotenv in migration/seed scripts:** Use dynamic imports so `dotenv.config()` runs before the database module evaluates — static imports get hoisted above it by ESM and the env vars aren't loaded yet.  
- **Self-vote blocking after data correction:** the app-layer check compares `voter` against `pitches.nominator` live, so it stays correct automatically once a nominator field is fixed via SQL — but any *cached* or previously-computed state (e.g. already-cast votes, already-computed results) won't retroactively change. Historical data from before a correction should generally be left standing rather than "fixed" after the fact, unless actively causing a bug.  
- **Historical data integrity:** some Chapter 2 data predates self-vote prevention rules; those states are valid and should stand, not be corrected for the sake of consistency.  
- **`.gitignore` was missing entirely early on** — caused a \~13,000-file staged diff including `node_modules` the first time changes were committed. Resolved by adding `.gitignore` and untracking `.DS_Store` before committing real source changes. Worth a sanity check if a future `git add` looks suspiciously large.

---

## Known Bugs Fixed

- **Rollover nominations blocked fresh nominations (Aug 2026):** `hasAlreadyNominated()` in `lib/queries/nominations.ts` checked for *any* `pitches` row matching `(cycleId, nominator)`, including rollover copies. Since a rollover carries the original nominator's pitch forward automatically, this meant a member whose book rolled over could never submit a new nomination the following cycle(s) — the app incorrectly told them they'd "already used their nomination." Fixed by scoping the check to `nominations.rolloverCount === 0` (i.e., only nominations genuinely new to the current cycle count against the slot). Confirmed via `aadvani`, whose Colour of Magic rollover was blocking a fresh Chapter 3 nomination.  
- **Seed data attribution error (Aug 2026):** Chapter 2's `nominations` table had two nominator/title pairs swapped from seeding — Colour of Magic showed `aadvani` instead of `wrose`, and The Bee Sting showed `msebela` instead of `aadvani`. Corrected via direct `pitches.nominator` updates, including the downstream rollover copy of Colour of Magic in Chapter 3 that had already inherited the wrong attribution.  
- **`upsertRating` incorrectly gated behind host reveal:** personal star ratings were blocked by the same `revealed` flag meant only to gate the BBC Overall average display. Fixed so members can always rate once a `history` row exists, independent of reveal state.  
- **History page misleading banner:** removed the "Everything the club has read, in order" banner, which was inaccurate once sorting by "Top rated" was introduced.

---

## Open Issues

- **Mobile viewport zoom bug (in progress):** the app renders zoomed-in and cropped on mobile Safari and Chrome immediately after login, persisting across page navigation. Confirmed on both browsers, ruling out a browser-specific cause — points to a missing or misconfigured viewport meta tag, likely in `app/layout.tsx` or a nested layout wrapping the authenticated routes. Not yet fixed; pending review of the layout file(s).

---

## Backlog

### Not yet built

1. **Allow nomination changes** — Members can replace/delete their original nomination post-submission (decided approach: full replace/delete, not an edit-in-place). Confirmation warning required before deleting. Known accepted edge case: if Member A changes away from a book that was blocking Member B (via duplicate-title check), Member B has no way to know the slot opened up — deprioritized, low impact since nominations are hidden from other members during nomination week anyway.  
2. **Feedback / Bug report / Feature request** — Add an option near Log Out. Not yet scoped — needs a routing/capture decision (email to host, form → DB, etc.) before building.

### Long-term / speculative

3. **Affiliate/purchase links** — Links to the selected book on Results (and possibly History) pages. Needs retailer decision(s) — Bookshop.org preferred — and affiliate program setup before scoping further.

### Separate project

4. **caddie-issues (golf round logging app):** hit Vercel's read-only filesystem limitation attempting `saveRound` with `writeFileSync`. Recommended path: same Neon Postgres \+ Drizzle pattern as this app. Schema and `saveRound` server action are ready to draft, not yet started.

