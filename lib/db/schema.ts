import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  real,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';

// The 9 members are a fixed list (see lib/members.ts), not a DB table —
// no need for a real table when the roster basically never changes and
// there's no per-member data (like a profile) beyond the username itself.

export const cycles = pgTable('cycles', {
  id: serial('id').primaryKey(),
  cycleNumber: integer('cycle_number').notNull(),
  phase: text('phase', { enum: ['nominating', 'voting', 'results'] })
    .notNull()
    .default('nominating'),
  nominationOpenedAt: timestamp('nomination_opened_at').notNull().defaultNow(),
  votingOpenedAt: timestamp('voting_opened_at'),
  resultsAt: timestamp('results_at'),
  meetingDate: timestamp('meeting_date'),
});

export const nominations = pgTable('nominations', {
  id: serial('id').primaryKey(),
  cycleId: integer('cycle_id').notNull().references(() => cycles.id),
  title: text('title').notNull(),
  author: text('author').notNull(),
  reviewLink: text('review_link'),
  coverUrl: text('cover_url'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  // how many cycles this entry has already rolled over (0 = brand new this cycle)
  rolloverCount: integer('rollover_count').notNull().default(0),
  // set once results are computed for the cycle this nomination belonged to
  finalPoints: integer('final_points'),
  finalRank: integer('final_rank'), // null if it didn't place (4th+) or was vetoed
  vetoedBy: text('vetoed_by'), // username, null if not vetoed
});

// The "double/triple nomination" merge model — one row per person who
// independently pitched the same book. headStart is derived (2 for the
// 2nd pitch, 3 for the 3rd+), not stored, to avoid it drifting out of sync.
export const pitches = pgTable('pitches', {
  id: serial('id').primaryKey(),
  nominationId: integer('nomination_id').notNull().references(() => nominations.id),
  nominator: text('nominator').notNull(), // username
  blurb: text('blurb').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const votes = pgTable(
  'votes',
  {
    cycleId: integer('cycle_id').notNull().references(() => cycles.id),
    voter: text('voter').notNull(), // username
    nominationId: integer('nomination_id').notNull().references(() => nominations.id),
    points: integer('points').notNull(), // 1-3, never 0 (no row = no points given)
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cycleId, t.voter, t.nominationId] }),
  })
);

export const vetoes = pgTable(
  'vetoes',
  {
    cycleId: integer('cycle_id').notNull().references(() => cycles.id),
    voter: text('voter').notNull(), // username — each member has exactly one veto, ever-renewing each cycle
    nominationId: integer('nomination_id').notNull().references(() => nominations.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cycleId, t.voter] }), // one veto per member per cycle
  })
);

export const history = pgTable('history', {
  id: serial('id').primaryKey(),
  nominationId: integer('nomination_id').notNull().references(() => nominations.id),
  cycleId: integer('cycle_id').notNull().references(() => cycles.id),
  dateRead: timestamp('date_read').notNull(),
  // becomes true the moment the host advances past the meeting date —
  // gates the "ta-da" reveal of the BBC Overall average on the History page
  revealed: boolean('revealed').notNull().default(false),
});

export const ratings = pgTable(
  'ratings',
  {
    historyId: integer('history_id').notNull().references(() => history.id),
    member: text('member').notNull(), // username
    stars: real('stars').notNull(), // 0.5 increments, 1-5
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.historyId, t.member] }), // one rating per member per book, always editable
  })
);
