# BBC App — Living Reference Document
*The Boys Book Club · Internal tool · Last updated: July 2026*

---

## What This App Does

A private web app for a 9-member offline book club that meets every 6 weeks. It manages a structured nomination and voting cycle:

1. **Nomination week (1 week):** Members anonymously nominate a book they haven't read. One nomination per member. Submissions stay hidden — only a counter is shown. Rollovers from the previous cycle are visible immediately.
2. **Voting week (1 week):** All nominations reveal at once ("ta-da"). Each member gets 3 points to distribute freely, or can use one veto to instantly eliminate a book (forfeiting their points). Members can't vote on their own nomination.
3. **Results:** Highest points wins. Ties broken by: most unique voters → earliest submission timestamp. Only the winner's nominator(s) are revealed. Vetoed books show who vetoed and their would-have-been score. 2nd and 3rd place roll over to the next cycle (points reset, content frozen).
4. **History:** Past reads with star ratings (1–5, half-star increments). BBC Overall rating is gated behind a host "reveal" after the meeting — the ta-da moment. Members can rate any time after results are revealed.

---

## Rules Summary

- **Members:** 9 fixed usernames (see below). Shared app password. No real user accounts.
- **Host:** `cwaters` — only member who can advance phases, start next cycle, reveal ratings.
- **Nominations:** One per member per cycle. Duplicate book titles → declined with error (choose something else or wait to vote). No read-history enforcement — honor system.
- **Voting:** 3 points OR one veto. No self-voting. Always editable until host closes voting.
- **Tie-break:** Most unique voters → earliest submission timestamp. Explanation shown honestly from real data.
- **Rollover:** 2nd and 3rd place roll over up to 2 times (3 total cycles) before needing fresh renomination. Vetoed books never roll over.
- **Single nomination:** If only 1 book nominated → selected by default, no vote held. Snarky message displayed.
- **Zero nominations + zero rollovers:** Nomination week auto-extends. Mor'gathuul the Atrocious, God of Vorlathiss, is invoked.
- **Ratings:** Editable any time after Results phase. BBC Overall = average of all member ratings, rounded to nearest 0.5. Revealed by host after meeting.

---

## Members

| Username | Role |
|---|---|
| `cwaters` | Host (admin) |
| `btaylor` | Member |
| `kjutkiewicz` | Member |
| `wrose` | Member |
| `asegoshi` | Member |
| `aadvani` | Member |
| `msebela` | Member |
| `dweimer` | Member |
| `tcourneen` | Member |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Hosting | Vercel |
| Database | Neon Postgres (via Vercel Storage) |
| ORM | Drizzle ORM (`@neondatabase/serverless` driver) |
| Auth | Shared password + HMAC-signed cookie (Web Crypto API, Edge-compatible) |
| Fonts | Lobster (club name), Inter (UI) |
| Styling | Tailwind CSS |
| Version control | GitHub (`cwaters3/bbc-app`) |

**Color palette:**
- Primary (moss): `#5C7A5C` / `#4A6449`
- Secondary (apricot): `#E0A878` / `#C98C5C`
- Danger (veto/error): `#C1554A`
- Background: `#FAF9F6`

---

## Live URLs

- **Production app:** `https://bbc-app-jet.vercel.app`
- **Demo (no auth, mock data):** `https://bbc-app-jet.vercel.app/demo`
- **GitHub Pages mockup (legacy):** `https://cwaters3.github.io/bbc-app/` *(old HTML mockup, kept for sharing)*

---

## Environment Variables

| Variable | Where set | Notes |
|---|---|---|
| `DATABASE_URL` | Vercel + `.env.local` | Manually added — Neon integration auto-sync had issues, set this by hand |
| `APP_PASSWORD` | Vercel + `.env.local` | Shared club password |
| `SESSION_SECRET` | Vercel + `.env.local` | Random hex string for HMAC signing |

**Important:** When pulling env vars locally, use:
```bash
vercel env pull .env.local --environment=production
```
The `DATABASE_URL` may come through empty from the Neon integration — if so, manually paste the real connection string from Neon's "Connect" panel into `.env.local`.

---

## Database Schema

```
cycles          — id, cycleNumber, phase (nominating/voting/results), timestamps
nominations     — id, cycleId, title, author, reviewLink, coverUrl, submittedAt,
                  rolloverCount, finalPoints, finalRank, vetoedBy
pitches         — id, nominationId, nominator, blurb, createdAt
votes           — cycleId, voter, nominationId, points (composite PK)
vetoes          — cycleId, voter, nominationId (one veto per member per cycle)
history         — id, nominationId, cycleId, dateRead, revealed
ratings         — historyId, member, stars (composite PK, always editable)
```

**Key design decisions:**
- Results are computed once and persisted (finalPoints/finalRank/vetoedBy on nominations) — not recalculated live
- Pitches are the many-side of nominations (one pitch per nominator) — enables the self-vote blocking to check by nominator across the pitch table
- `revealed` on history gates the BBC Overall average showing on the History page

---

## File Map

```
bbc-app/
├── middleware.ts                    — Auth gate; /demo and /login are public
├── lib/
│   ├── auth.ts                      — Password check, cookie sign/verify
│   ├── members.ts                   — Fixed roster of 9 + HOST constant
│   ├── session.ts                   — getCurrentMember() for server components
│   ├── cycles.ts                    — getCurrentCycle(), advancePhase() (triggers results computation)
│   ├── coverArt.ts                  — Server-side Open Library cover lookup
│   ├── db/
│   │   ├── index.ts                 — Drizzle client
│   │   ├── schema.ts                — Full table definitions
│   │   ├── migrate.ts               — Migration runner script
│   │   └── seed.ts                  — Creates cycle #1
│   └── queries/
│       ├── nominations.ts           — Submit, fetch, one-per-member check, duplicate decline
│       ├── votes.ts                 — Fetch vote state, submit/replace vote
│       ├── results.ts               — computeAndPersistResults(), getUniqueVoterCounts()
│       ├── history.ts               — Fetch history entries, upsertRating(), revealRatings()
│       └── next-cycle.ts            — startNextCycle() — rollover logic + new cycle creation
├── app/
│   ├── layout.tsx                   — Root layout, fonts
│   ├── globals.css                  — Tailwind entry
│   ├── page.tsx                     — Nominate page (/)
│   ├── top-nav.tsx                  — Shared tab nav + Chapter N label
│   ├── cover.tsx                    — Book cover image component
│   ├── stars.tsx                    — RatingDisplay + RatingInput components
│   ├── logout-button.tsx            — Log out client component
│   ├── nomination-form.tsx          — Nomination submission form
│   ├── host-advance-button.tsx      — Close nominations / Close voting
│   ├── start-next-cycle-button.tsx  — Start next cycle (host only)
│   ├── login/page.tsx               — Login page
│   ├── vote/page.tsx                — Vote page (/vote)
│   ├── vote-form.tsx                — Interactive points/veto form
│   ├── results/page.tsx             — Results page (/results)
│   ├── history/
│   │   ├── page.tsx                 — History page (/history)
│   │   ├── sort-toggle.tsx          — Date/rating sort toggle
│   │   └── reveal-button.tsx        — Host-only reveal ratings button
│   ├── rules/page.tsx               — Rules page (/rules)
│   └── api/
│       ├── auth/login/route.ts      — POST /api/auth/login
│       ├── auth/logout/route.ts     — POST /api/auth/logout
│       ├── nominations/route.ts     — POST /api/nominations
│       ├── votes/route.ts           — POST /api/votes
│       ├── cycles/advance/route.ts  — POST /api/cycles/advance (host only)
│       ├── cycles/next/route.ts     — POST /api/cycles/next (host only)
│       ├── ratings/route.ts         — POST /api/ratings
│       └── history/reveal/route.ts  — POST /api/history/reveal (host only)
└── public/
    └── demo/index.html              — Fully interactive mock-data demo (no auth)
```

---

## Local Dev Setup

```bash
# Install dependencies
npm install

# Pull real env vars (DATABASE_URL may be empty — see note above)
vercel env pull .env.local --environment=production

# Run dev server
npm run dev
# → http://localhost:3000
```

**Database scripts (only needed when schema changes):**
```bash
npm run db:generate   # Generate SQL migration from schema.ts
npm run db:migrate    # Apply migrations to the real Neon database
npm run db:seed       # Create cycle #1 (only if cycles table is empty)
```

**Important dotenv note:** The migration/seed scripts use dynamic imports to work around ESM hoisting — `dotenv` must load before the DB client imports. Don't change the import pattern in `migrate.ts` or `seed.ts`.

---

## Current Real Data

- **Cycle #1:** Complete. Phase = results. Winner: Dungeon Crawler Carl (Matt Dinniman), nominated by btaylor, June 17 2026.
- **Cycle #2:** Active. Phase = nominating. No nominations yet. No rollovers (DCC was the only nomination in Cycle 1).

---

## Backlog (as of July 2026)

### Confirmed UI fixes
1. **Phase-gating empty states** — "Nomination week is still open" etc. currently use the thin accent-bar banner style. Since these are the entire page content, they need a full-page centered empty-state treatment instead.
2. **Star alignment fix (History page)** — When BBC Overall shows a numeric score next to stars, the two rating rows (BBC Overall + Your Rating) misalign. Both rows should stay left-aligned on label, right-aligned on stars/number, consistently.
3. **"Chapter N" label on History and Rules pages** — These pages don't fetch the active cycle, so TopNav loses the chapter label. Fix: fetch current cycle on those pages and pass it to TopNav.
4. **Rules page overhaul** — Currently a wall-of-text list. Restructure as collapsible accordion sections by topic (nominating, voting, results, rollover); trim/simplify copy where possible.

### Features not yet built
5. **"Your rating" star input on Results page** — Add star rating input to the winner card on Results so members can rate immediately when results are revealed. Needs to look up the history entry ID for the current cycle's winner to wire up `RatingInput`.
6. **Allow nomination changes** — Members can replace/delete their original nomination post-submission (Option 1). Confirmation warning required. Known accepted edge case (Option 2): if Member A changes away from a book that blocked Member B, Member B won't know the slot opened. Self-vote blocking attribution must stay correct after any change. Low priority since nominations are hidden from others during nomination week anyway.
7. **Feedback / Bug report / Feature request** — Add option near Log Out. Not yet scoped — needs a routing/capture decision (email to host, form to DB, etc.) before building.

### Long-term / speculative
8. **Affiliate/purchase links** — Links to selected book on Results (and possibly History). Decisions needed on retailer(s) — Bookshop.org preferred — affiliate program setup, and product direction fit.
