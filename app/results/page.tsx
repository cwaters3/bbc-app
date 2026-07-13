import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { getNominationsForCycle } from '@/lib/queries/nominations';
import { getUniqueVoterCounts } from '@/lib/queries/results';
import { getHistoryIdForCycle, getMyRating } from '@/lib/queries/history';
import { HOST } from '@/lib/members';
import TopNav from '../top-nav';
import HostAdvanceButton from '../host-advance-button';
import StartNextCycleButton from '../start-next-cycle-button';
import LogoutButton from '../logout-button';
import EmptyState from '../empty-state';
import ResultsView from './results-view';
import type { Member } from '@/lib/members';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const member = await getCurrentMember();
  const cycle = await getCurrentCycle();

  if (!cycle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center text-muted">
        No active cycle found.
      </div>
    );
  }

  return (
    <div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">The Boys Book Club</h1>
      </div>
      <TopNav active="Results" chapterNumber={cycle?.cycleNumber} />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        {cycle.phase !== 'results' ? (
          <EmptyState
            icon="🏆"
            title="Results aren't in yet"
            description={
              cycle.phase === 'nominating'
                ? 'Nomination week is still open — check back once voting wraps up.'
                : 'Voting is still open — check back once it closes.'
            }
            cta={
              cycle.phase === 'nominating'
                ? { label: 'Go to Nominate', href: '/' }
                : { label: 'Go to Vote', href: '/vote' }
            }
          />
        ) : (
          <ResultsBody cycleId={cycle.id} member={member!} />
        )}

        {member === HOST && cycle.phase === 'voting' && (
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-2">Host controls</span>
            <HostAdvanceButton label="Close voting" />
          </div>
        )}

        {member === HOST && cycle.phase === 'results' && (
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-2">Host controls</span>
            <StartNextCycleButton />
          </div>
        )}

        <div className="mt-4 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

async function ResultsBody({ cycleId, member }: { cycleId: number; member: Member }) {
  const nominations = await getNominationsForCycle(cycleId);
  const winner = nominations.find((n) => n.finalRank === 1);
  const placed = nominations.filter((n) => n.finalRank !== null && n.finalRank !== 1);
  const ranked = [winner, ...placed].filter((n): n is NonNullable<typeof n> => !!n);
  const voterCounts = await getUniqueVoterCounts(ranked.map((n) => n.id));

  const historyId = winner ? await getHistoryIdForCycle(cycleId) : null;
  const myRating = historyId ? await getMyRating(historyId, member) : null;

  return (
    <ResultsView
      nominations={nominations}
      voterCounts={voterCounts}
      historyId={historyId}
      myRating={myRating}
    />
  );
}
