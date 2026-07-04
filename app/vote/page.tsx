import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { getNominationsForCycle } from '@/lib/queries/nominations';
import { getVoteState } from '@/lib/queries/votes';
import { HOST, type Member } from '@/lib/members';
import TopNav from '../top-nav';
import VoteForm from '../vote-form';
import HostAdvanceButton from '../host-advance-button';
import LogoutButton from '../logout-button';

export const dynamic = 'force-dynamic';

export default async function VotePage() {
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
      <TopNav active="Vote" chapterNumber={cycle?.cycleNumber} />

      <div className="max-w-xl mx-auto px-4 py-5 pb-24">
        {cycle.phase === 'nominating' ? (
          <div className="bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 text-sm">
            Nomination week is still open — voting hasn&apos;t started yet.
          </div>
        ) : cycle.phase === 'results' ? (
          <div className="bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 text-sm">
            Voting has closed for this cycle — head to the Results tab.
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
              <span>📌</span>
              <div>
                Distribute <b>3 points</b> across nominees, or use your{' '}
                <b className="text-danger">one veto</b>. Hidden until voting closes. Your vote
                stays editable until then.
              </div>
            </div>

            <VotePageBody cycleId={cycle.id} member={member!} />
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

async function VotePageBody({ cycleId, member }: { cycleId: number; member: Member }) {
  const nominations = await getNominationsForCycle(cycleId);
  const voteState = await getVoteState(cycleId, member);

  if (nominations.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        No nominations were submitted this cycle.
      </p>
    );
  }

  return (
    <VoteForm
      key={member}
      nominations={nominations}
      currentUser={member}
      initialPoints={voteState.points}
      initialVeto={voteState.vetoNominationId}
    />
  );
}
