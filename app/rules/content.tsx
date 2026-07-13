import { type ReactNode } from 'react';
import { type RuleSection } from './accordion';

export function RuleList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="text-sm leading-relaxed text-ink [&>li+li]:border-t [&>li+li]:border-dashed [&>li+li]:border-border [&>li+li]:mt-2 [&>li+li]:pt-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export const RULE_SECTIONS: RuleSection[] = [
  {
    title: 'Nominating',
    subtitle: '1 week',
    content: (
      <RuleList
        items={[
          <>
            <b className="text-moss-dark">One nomination per member</b> — a book you haven&apos;t
            read yourself. Honor system.
          </>,
          <>
            Nominations <b className="text-moss-dark">stay hidden</b> until voting opens. Rollover
            books from last cycle are already public.
          </>,
          <>No one&apos;s required to nominate.</>,
          <>
            Someone already nominated that book this cycle? You&apos;ll be asked to pick a
            different one, or wait and vote for it once voting opens.
          </>,
        ]}
      />
    ),
  },
  {
    title: 'Voting',
    subtitle: '1 week',
    content: (
      <RuleList
        items={[
          <>
            <b className="text-moss-dark">3 points</b> to distribute however you want — all on
            one book, or split across a few.
          </>,
          <>
            Or use your <b className="text-moss-dark">one veto</b> to instantly eliminate a book.
            Costs you those 3 points.
          </>,
          <>
            You <b className="text-moss-dark">can&apos;t vote</b> on a book you nominated.
          </>,
          <>
            Nothing&apos;s visible until results are in — no totals, no individual votes.
          </>,
        ]}
      />
    ),
  },
  {
    title: 'Results',
    content: (
      <RuleList
        items={[
          <>
            <b className="text-moss-dark">Highest points wins.</b> Ties break by most unique
            voters, then earliest submission.
          </>,
          <>
            Only the <b className="text-moss-dark">winner&apos;s nominator(s)</b> are revealed —
            everyone else stays anonymous.
          </>,
          <>A vetoed book shows who vetoed it and what it would&apos;ve scored.</>,
        ]}
      />
    ),
  },
  {
    title: 'Rollover',
    content: (
      <RuleList
        items={[
          <>
            <b className="text-moss-dark">2nd and 3rd place</b> roll into next cycle, points
            reset to zero.
          </>,
          <>
            A book can roll over <b className="text-moss-dark">up to twice</b> (3 cycles total)
            before it needs fresh renomination.
          </>,
          <>
            Vetoed books <b className="text-moss-dark">never</b> roll over.
          </>,
        ]}
      />
    ),
  },
];
