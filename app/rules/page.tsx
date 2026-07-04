import TopNav from '../top-nav';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11.5px] uppercase tracking-wide text-muted-2 mt-5 mb-2 first:mt-0">
        {title}
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function Rule({ children, flavor }: { children: React.ReactNode; flavor?: boolean }) {
  return (
    <li
      className={`border rounded-lg px-4 py-3 text-sm leading-relaxed ${
        flavor ? 'bg-apricot-tint border-apricot' : 'bg-card border-border shadow-sm2'
      }`}
    >
      {children}
    </li>
  );
}

export default function RulesPage() {
  return (
    <div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">The Boys Book Club</h1>
      </div>
      <TopNav active="Rules" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14 text-ink">
        <Section title="Nomination week (1 week)">
          <Rule>
            <b className="text-moss-dark">One nomination per member</b>, and it has to be a book
            you haven&apos;t read yourself. Honor system — we don&apos;t check.
          </Rule>
          <Rule>
            <b className="text-moss-dark">New</b> nominations stay hidden while nomination week is
            open and reveal together once voting opens. <b className="text-moss-dark">Rollover</b>{' '}
            books from last cycle are already public, so they show up right away.
          </Rule>
          <Rule>No one is required to nominate.</Rule>
          <Rule>
            If the same book gets nominated by <b className="text-moss-dark">two or more people
            independently</b>, it merges into one entry with a head start:{' '}
            <b className="text-moss-dark">2 points for a double-nomination, 3 for a triple</b>{' '}
            (capped at 3). Both pitches are shown side by side.
          </Rule>
        </Section>

        <Section title="If nothing gets nominated">
          <Rule flavor>
            If a cycle ends with <b className="text-apricot-dark">zero new nominations and zero
            rollovers</b>, <b className="text-apricot-dark">Mor&apos;gathuul the Atrocious, God of
            Vorlathiss</b>, claims the club&apos;s souls and we are disbanded for all eternity.
            (Not really — nomination week just automatically extends.)
          </Rule>
        </Section>

        <Section title="Voting week (1 week)">
          <Rule>
            Every member gets <b className="text-moss-dark">3 points</b> to distribute however
            they want — all 3 on one book, or split across a few.
          </Rule>
          <Rule>
            Instead of points, you can use your <b className="text-moss-dark">one veto</b> to
            instantly eliminate a book. Using it forfeits your 3 points that round.
          </Rule>
          <Rule>
            You <b className="text-moss-dark">can&apos;t vote on a book you nominated</b> (or
            co-nominated, for a merged double/triple).
          </Rule>
          <Rule>
            During voting week, nothing is visible — no totals, no individual votes. Once results
            are in, each book&apos;s final point total is shown, and a veto reveals who cast it.
          </Rule>
        </Section>

        <Section title="Results">
          <Rule>
            Highest point total wins. <b className="text-moss-dark">Ties</b> are broken first by
            whichever book got votes from the most unique people, then by whichever was submitted
            earliest.
          </Rule>
          <Rule>
            Only the <b className="text-moss-dark">winning book&apos;s nominator(s)</b> are
            revealed. Everyone else stays anonymous.
          </Rule>
          <Rule>A vetoed book shows who vetoed it and what its point total would&apos;ve been.</Rule>
        </Section>

        <Section title="Rollover">
          <Rule>
            The <b className="text-moss-dark">2nd and 3rd place</b> finishers automatically roll
            into next cycle&apos;s nomination list, points reset to zero. (Just 2nd place if there
            were only 2 nominees.)
          </Rule>
          <Rule>
            A book can roll over <b className="text-moss-dark">up to twice</b> (3 cycles total)
            before it has to be freshly renominated to stay eligible.
          </Rule>
        </Section>
      </div>
    </div>
  );
}
