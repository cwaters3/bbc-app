'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../../top-nav';
import Cover from '../../cover';
import { RatingDisplay, RatingInput } from '../../stars';
import { DEMO_CLUB_NAME, DEMO_CHAPTER_NUMBER, DEMO_HISTORY_ENTRIES, type DemoHistoryEntry } from '@/lib/demo/fixtures';

export default function DemoHistoryPage() {
  const [entries, setEntries] = useState<DemoHistoryEntry[]>(DEMO_HISTORY_ENTRIES);
  const [sort, setSort] = useState<'date' | 'rating'>('date');
  const [resetKey, setResetKey] = useState(0);

  const sorted = [...entries].sort((a, b) => {
    if (sort === 'rating') return (b.overallRating ?? -1) - (a.overallRating ?? -1);
    return b.dateRead.getTime() - a.dateRead.getTime();
  });

  function handleReveal(id: number) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, revealed: true } : e)));
  }

  function handleRate(id: number, stars: number) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, myRating: stars } : e)));
  }

  function handleReset() {
    setEntries(DEMO_HISTORY_ENTRIES);
    setSort('date');
    setResetKey((k) => k + 1);
  }

  return (
    <div>
      <div className="bg-apricot-tint text-apricot-dark text-center text-xs font-semibold py-1.5">
        🎭 Demo — fictional data, nothing here is saved
      </div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">{DEMO_CLUB_NAME}</h1>
      </div>
      <TopNav active="History" chapterNumber={DEMO_CHAPTER_NUMBER} basePath="/demo" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
          <span>📚</span>
          <div>Everything the club has read, in order.</div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSort('date')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${
              sort === 'date' ? 'bg-moss text-white border-moss' : 'bg-card text-muted border-border'
            }`}
          >
            Date read
          </button>
          <button
            onClick={() => setSort('rating')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${
              sort === 'rating' ? 'bg-moss text-white border-moss' : 'bg-card text-muted border-border'
            }`}
          >
            Top rated
          </button>
        </div>

        <div key={resetKey}>
          {sorted.map((entry) => (
            <div key={entry.id} className="bg-card border border-border rounded-xl shadow-card mb-4 overflow-hidden">
              <div className="flex gap-3.5 p-4">
                <Cover title={entry.nomination.title} coverUrl={entry.nomination.coverUrl} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[16px]">{entry.nomination.title}</h3>
                  <div className="text-xs text-muted uppercase mb-2">{entry.nomination.author}</div>
                  <div className="text-[11.5px] text-muted-2 mb-2">
                    Read{' '}
                    {entry.dateRead.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}{' '}
                    · nominated by <b className="text-ink">{entry.nomination.nominators.join(' & ')}</b>
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
                    <span className="text-xs text-muted-2 italic">Reveals after the meeting</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-muted-2 uppercase tracking-wide">
                    Your rating
                  </span>
                  <RatingInput
                    historyId={entry.id}
                    initial={entry.myRating}
                    onRate={async (stars) => handleRate(entry.id, stars)}
                  />
                </div>

                {!entry.revealed && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        if (confirm('Reveal the BBC Overall rating for this book? This cannot be undone.')) {
                          handleReveal(entry.id);
                        }
                      }}
                      className="text-xs font-semibold text-apricot-dark border border-apricot rounded-full px-3 py-1"
                    >
                      Reveal ratings
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <button onClick={handleReset} className="text-xs font-semibold text-muted-2 hover:text-ink">
            ↺ Reset demo
          </button>
          <Link href="/login" className="text-xs font-semibold text-moss-dark">
            Exit demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
