// Fictional data for the /demo route. None of this touches the real database —
// deliberately a different club name and roster from the real one, so it's
// obviously not real club data if anyone stumbles onto it.

export const DEMO_CLUB_NAME = 'Chapter & Verse';

export const DEMO_MEMBERS = [
  'rmarquez',
  'tholloway',
  'ksanchez',
  'dobrien',
  'npatel',
  'lkowalski',
  'fabara',
  'wchen',
  'mgunderson',
] as const;

export const DEMO_HOST = 'rmarquez';

// The "you" identity for a visitor browsing the demo — deliberately someone
// who hasn't nominated anything in the Vote fixture below, so every book is
// votable without hitting the self-vote block.
export const DEMO_VIEWER = 'rmarquez';

export const DEMO_CHAPTER_NUMBER = 4;

// ---- Nominate page fixture ----

export const DEMO_NOMINATE_ROLLOVER = {
  id: 9001,
  title: 'Piranesi',
  author: 'Susanna Clarke',
  reviewLink: null as string | null,
  coverUrl: null as string | null,
  rolloverCount: 1,
  pitches: [{ nominator: 'npatel', blurb: 'Weird in the best way. Also short.' }],
};

export const DEMO_NOMINATE_INITIAL_FRESH_COUNT = 4;

// ---- Vote page fixture ----

export type DemoNomination = {
  id: number;
  title: string;
  author: string;
  reviewLink: string | null;
  coverUrl: string | null;
  rolloverCount: number;
  pitches: { nominator: string; blurb: string }[];
};

// ---- Results page fixture ----

export type DemoResultNomination = {
  id: number;
  title: string;
  author: string;
  reviewLink: string | null;
  coverUrl: string | null;
  rolloverCount: number;
  pitches: { nominator: string; blurb: string }[];
  finalPoints: number | null;
  finalRank: number | null;
  vetoedBy: string | null;
};

export const DEMO_RESULTS_NOMINATIONS: DemoResultNomination[] = [
  {
    id: 201,
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'ksanchez', blurb: 'Quietly devastating. An AI narrator done right.' }],
    finalPoints: 9,
    finalRank: 1,
    vetoedBy: null,
  },
  {
    id: 202,
    title: 'The Vanishing Half',
    author: 'Brit Bennett',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'tholloway', blurb: 'Sisters, identity, and secrets across decades.' }],
    finalPoints: 7,
    finalRank: 2,
    vetoedBy: null,
  },
  {
    id: 203,
    title: 'The Invisible Life of Addie LaRue',
    author: 'V.E. Schwab',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 1,
    pitches: [{ nominator: 'mgunderson', blurb: 'A 300-year curse. Longing, done beautifully.' }],
    finalPoints: 7,
    finalRank: 3,
    vetoedBy: null,
  },
  {
    id: 204,
    title: 'Bunny',
    author: 'Mona Awad',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'fabara', blurb: 'Dark academia gone feral. Not for everyone.' }],
    finalPoints: 5,
    finalRank: null,
    vetoedBy: 'wchen',
  },
  {
    id: 205,
    title: "Vera Wong's Unsolicited Advice for Murderers",
    author: 'Jesse Q. Sutanto',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'dobrien', blurb: 'Cozy mystery with a genuinely great lead.' }],
    finalPoints: 2,
    finalRank: null,
    vetoedBy: null,
  },
];

// 2nd and 3rd place are deliberately tied at 7 points with different unique-voter
// counts, so the demo shows off the honest tie-break explanation text too.
export const DEMO_RESULTS_VOTER_COUNTS = new Map<number, number>([
  [201, 6],
  [202, 5],
  [203, 3],
]);

export const DEMO_RESULTS_HISTORY_ID = 9999;

// ---- Vote page fixture (continued) ----

export const DEMO_VOTE_NOMINATIONS: DemoNomination[] = [
  {
    id: 1,
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'wchen', blurb: 'Video games, friendship, and grief. Sounds heavy, reads fast.' }],
  },
  {
    id: 2,
    title: 'Piranesi',
    author: 'Susanna Clarke',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 1,
    pitches: [{ nominator: 'npatel', blurb: 'Weird in the best way. Also short.' }],
  },
  {
    id: 3,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'dobrien', blurb: 'Actually laughed out loud twice.' }],
  },
  {
    id: 4,
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    reviewLink: null,
    coverUrl: null,
    rolloverCount: 0,
    pitches: [{ nominator: 'lkowalski', blurb: 'Greek mythology, but it will wreck you emotionally.' }],
  },
];
