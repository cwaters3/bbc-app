import Cover from '../cover';
import { RatingInput } from '../stars';

export type ResultsNomination = {
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

function headStartLabel(pitchCount: number): string {
  if (pitchCount >= 3) return 'Triple nomination';
  if (pitchCount === 2) return 'Double nomination';
  return '';
}

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

export default function ResultsView({
  nominations,
  voterCounts,
  historyId,
  myRating,
  onRate,
}: {
  nominations: ResultsNomination[];
  voterCounts: Map<number, number>;
  historyId: number | null;
  myRating: number | null;
  /** Optional override forwarded to RatingInput — if provided, ratings run against
   * local state instead of the real /api/ratings call. Used by the demo route. */
  onRate?: (stars: number) => Promise<void>;
}) {
  const winner = nominations.find((n) => n.finalRank === 1);
  const placed = nominations
    .filter((n) => n.finalRank !== null && n.finalRank !== 1)
    .sort((a, b) => (a.finalRank ?? 99) - (b.finalRank ?? 99));
  const vetoed = nominations.filter((n) => n.vetoedBy !== null);
  const nonPlacing = nominations.filter((n) => n.finalRank === null && n.vetoedBy === null);

  const ranked = [winner, ...placed].filter((n): n is NonNullable<typeof n> => !!n);

  // Check every adjacent pair for a points tie and build an honest explanation
  // from the real numbers — never assume which tiebreak rule actually applied.
  const tieNotes: string[] = [];
  for (let i = 0; i < ranked.length - 1; i++) {
    const a = ranked[i];
    const b = ranked[i + 1];
    if (a.finalPoints !== b.finalPoints) continue;

    const aVoters = voterCounts.get(a.id) ?? 0;
    const bVoters = voterCounts.get(b.id) ?? 0;
    const aLabel = ORDINALS[i] ?? `#${i + 1}`;
    const bLabel = ORDINALS[i + 1] ?? `#${i + 2}`;

    if (aVoters !== bVoters) {
      tieNotes.push(
        `${aLabel} and ${bLabel} place tied at ${a.finalPoints} points each — ${aLabel} place wins the tie because it got votes from more unique members (${aVoters} vs ${bVoters}).`
      );
    } else {
      tieNotes.push(
        `${aLabel} and ${bLabel} place tied at ${a.finalPoints} points each, even on unique voters (${aVoters} each) — ${aLabel} place wins because it was submitted earlier.`
      );
    }
  }

  return (
    <>
      <div className="flex items-start gap-2.5 bg-moss-tint rounded-md p-3.5 mb-4 text-sm font-semibold text-moss-dark">
        <span>🎉</span>
        <div>All nominations revealed — here&apos;s how it shook out.</div>
      </div>

      {tieNotes.map((note, i) => (
        <p key={i} className="text-xs text-muted italic -mt-2 mb-3.5">
          {note}
        </p>
      ))}

      {winner && (
        <div className="bg-gradient-to-b from-moss-tint to-card border-2 border-moss rounded-xl shadow-card mb-3.5 overflow-hidden">
          <div className="flex gap-3.5 p-4">
            <Cover title={winner.title} coverUrl={winner.coverUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[16px]">{winner.title}</h3>
                <span className="bg-moss text-white text-xs font-bold px-3 py-1 rounded-full">
                  🏆 Selected
                </span>
              </div>
              <div className="text-xs text-muted uppercase mb-1.5">{winner.author}</div>
              {winner.pitches.map((p, i) => (
                <p key={i} className="text-sm mb-1">
                  {winner.pitches.length > 1 && (
                    <span className="text-[10.5px] font-bold text-moss-dark uppercase mr-1.5">
                      Pitch {i + 1}
                    </span>
                  )}
                  {p.blurb}
                </p>
              ))}
              {winner.reviewLink && (
                <a
                  href={winner.reviewLink}
                  target="_blank"
                  className="text-moss-dark underline text-[11.5px]"
                >
                  Review link ↗
                </a>
              )}
              <div className="text-[12.5px] text-muted mt-2 pt-2 border-t border-dashed border-border">
                <b className="text-ink">{winner.finalPoints} points</b> · nominated by{' '}
                <b className="text-ink">{winner.pitches.map((p) => p.nominator).join(' & ')}</b>
              </div>
              {historyId && (
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-border">
                  <span className="text-[11px] font-bold text-muted-2 uppercase tracking-wide">
                    Your rating
                  </span>
                  <RatingInput historyId={historyId} initial={myRating} onRate={onRate} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {placed.map((n) => (
        <div key={n.id} className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden">
          <div className="flex gap-3.5 p-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bg border border-border flex items-center justify-center text-xs font-bold text-muted-2">
              {n.finalRank}
            </div>
            <Cover title={n.title} coverUrl={n.coverUrl} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[16px]">{n.title}</h3>
              <div className="text-xs text-muted uppercase mb-1.5">{n.author}</div>
              {n.pitches.length > 1 && (
                <span className="inline-block bg-moss-tint text-moss-dark text-[10.5px] font-bold px-2.5 py-0.5 rounded-full mb-1.5">
                  {headStartLabel(n.pitches.length)}
                </span>
              )}
              <div className="text-[12.5px] text-muted mt-1.5 pt-1.5 border-t border-dashed border-border">
                {n.finalPoints} points
                {(n.finalRank === 2 || n.finalRank === 3) && (
                  <>
                    {' '}
                    ·{' '}
                    <span className="bg-apricot-tint text-apricot-dark font-bold px-2 py-0.5 rounded-full text-[11px]">
                      Rolls over ({n.rolloverCount + 1}/2)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {vetoed.map((n) => (
        <div
          key={n.id}
          className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden opacity-75"
        >
          <div className="flex gap-3.5 p-4">
            <Cover title={n.title} coverUrl={n.coverUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[16px]">{n.title}</h3>
                <span className="bg-danger-tint text-danger text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Vetoed
                </span>
              </div>
              <div className="text-xs text-muted uppercase mb-1.5">{n.author}</div>
              <div className="text-[12.5px] text-muted mt-1.5 pt-1.5 border-t border-dashed border-border">
                Vetoed by <b className="text-ink">{n.vetoedBy}</b> · would&apos;ve scored{' '}
                <b className="text-ink">{n.finalPoints} points</b> · gone for good
              </div>
            </div>
          </div>
        </div>
      ))}

      {nonPlacing.map((n) => (
        <div key={n.id} className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden">
          <div className="flex gap-3.5 p-4">
            <Cover title={n.title} coverUrl={n.coverUrl} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[16px]">{n.title}</h3>
              <div className="text-xs text-muted uppercase mb-1.5">{n.author}</div>
              <div className="text-[12.5px] text-muted mt-1.5 pt-1.5 border-t border-dashed border-border">
                {n.finalPoints} points · didn&apos;t place — gone unless renominated fresh
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-moss-tint rounded-md p-3.5 mt-4 text-center text-sm font-semibold text-moss-dark">
        🗓️ Next meeting date to be set by the host.
      </div>
    </>
  );
}
