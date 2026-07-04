import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { getNominationsForCycle } from '@/lib/queries/nominations';
import { HOST } from '@/lib/members';
import TopNav from './top-nav';
import Cover from './cover';
import NominationForm from './nomination-form';
import HostAdvanceButton from './host-advance-button';
import LogoutButton from './logout-button';
import EmptyState from './empty-state';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const member = await getCurrentMember();
  const cycle = await getCurrentCycle();

  if (!cycle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center text-muted">
        No active cycle found. Run <code>npm run db:seed</code> to create one.
      </div>
    );
  }

  const nominations = await getNominationsForCycle(cycle.id);
  const rollovers = nominations.filter((n) => n.rolloverCount > 0);
  const fresh = nominations.filter((n) => n.rolloverCount === 0);

  return (
    <div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">The Boys Book Club</h1>
      </div>
      <TopNav active="Nominate" chapterNumber={cycle?.cycleNumber} />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        {cycle.phase !== 'nominating' ? (
          <EmptyState
            icon="📌"
            title="Nomination week is closed"
            description="This cycle's book has already been nominated — head to the Vote tab to see what's in the running."
            cta={{ label: 'Go to Vote', href: '/vote' }}
          />
        ) : (
          <>
            <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
              <span>📌</span>
              <div className="flex-1">
                Nominations stay hidden until voting opens. Full rules in the Rules tab.
              </div>
            </div>

            <NominationForm />

            {rollovers.length > 0 && (
              <>
                <div className="text-[11px] uppercase tracking-wide text-muted-2 mb-2">
                  Rolling over from last cycle
                </div>
                {rollovers.map((n) => (
                  <div
                    key={n.id}
                    className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden"
                  >
                    <div className="flex gap-3.5 p-4">
                      <Cover title={n.title} coverUrl={n.coverUrl} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[16px]">{n.title}</h3>
                        <div className="text-xs text-muted uppercase mb-1.5">{n.author}</div>
                        <p className="text-sm">{n.pitches[0]?.blurb}</p>
                        <div className="flex gap-2.5 items-center mt-2 text-[11.5px]">
                          <span className="bg-apricot-tint text-apricot-dark font-bold px-2.5 py-0.5 rounded-full">
                            Rollover {n.rolloverCount}/2
                          </span>
                          {n.reviewLink && (
                            <a href={n.reviewLink} target="_blank" className="text-moss-dark underline">
                              Review link ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-[11px] uppercase tracking-wide text-muted-2 mb-2 mt-4">
                  New this week
                </div>
              </>
            )}

            <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 text-sm">
              <span>👀</span>
              <div>
                <b>{fresh.length}</b> new nomination{fresh.length === 1 ? '' : 's'} submitted so
                far.
              </div>
            </div>
          </>
        )}

        {member === HOST && (
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-2">Host controls</span>
            {cycle.phase === 'nominating' && <HostAdvanceButton label="Close nominations" />}
            {cycle.phase === 'voting' && <HostAdvanceButton label="Close voting" />}
            {cycle.phase === 'results' && (
              <span className="text-xs text-muted-2">Cycle complete</span>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
