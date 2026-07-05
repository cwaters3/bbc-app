import { Suspense } from 'react';
import { getCurrentMember } from '@/lib/session';
import { getCurrentCycle } from '@/lib/cycles';
import { getHistory } from '@/lib/queries/history';
import { HOST } from '@/lib/members';
import TopNav from '../top-nav';
import Cover from '../cover';
import LogoutButton from '../logout-button';
import SortToggle from './sort-toggle';
import RevealRatingsButton from './reveal-button';
import { RatingDisplay, RatingInput } from '../stars';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const member = await getCurrentMember();
  const cycle = await getCurrentCycle();
  const sort = searchParams.sort === 'rating' ? 'rating' : 'date';
  const entries = await getHistory(member!, sort);

  return (
    <div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">The Boys Book Club</h1>
      </div>
      <TopNav active="History" chapterNumber={cycle?.cycleNumber} />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
          <span>📚</span>
          <div>Everything the club has read, in order.</div>
        </div>

        <Suspense>
          <SortToggle current={sort} />
        </Suspense>

        {entries.length === 0 ? (
          <div className="text-center text-muted text-sm py-10">
            No books in the history yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-card border border-border rounded-xl shadow-card mb-4 overflow-hidden"
            >
              <div className="flex gap-3.5 p-4">
                <Cover
                  title={entry.nomination.title}
                  coverUrl={entry.nomination.coverUrl}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[16px]">{entry.nomination.title}</h3>
                  <div className="text-xs text-muted uppercase mb-2">
                    {entry.nomination.author}
                  </div>
                  <div className="text-[11.5px] text-muted-2 mb-2">
                    Read{' '}
                    {entry.dateRead.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    · nominated by{' '}
                    <b className="text-ink">
                      {entry.nomination.nominators.join(' & ')}
                    </b>
                  </div>

                  {entry.nomination.reviewLink && (
                    <a
                      href={entry.nomination.reviewLink}
                      target="_blank"
                      className="text-moss-dark underline text-[11.5px]"
                    >
                      Review link ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-border px-4 py-3 bg-[#FCFBF8] space-y-2.5">
                {/* BBC Overall */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-muted-2 uppercase tracking-wide">
                    BBC Overall
                  </span>
                  {entry.revealed ? (
                    entry.overallRating !== null ? (
                      <RatingDisplay value={entry.overallRating} />
                    ) : (
                      <span className="text-xs text-muted-2 italic">No ratings yet</span>
                    )
                  ) : (
                    <span className="text-xs text-muted-2 italic">
                      Reveals after the meeting
                    </span>
                  )}
                </div>

                {/* Personal rating — only show if revealed */}
                {entry.revealed && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-muted-2 uppercase tracking-wide">
                      Your rating
                    </span>
                    <RatingInput historyId={entry.id} initial={entry.myRating} />
                  </div>
                )}

                {/* Host-only reveal button */}
                {member === HOST && !entry.revealed && (
                  <div className="flex justify-end pt-1">
                    <RevealRatingsButton historyId={entry.id} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="mt-4 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
