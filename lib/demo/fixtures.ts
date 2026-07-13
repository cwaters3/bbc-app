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
