'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cover from './cover';

type Pitch = { nominator: string; blurb: string };
type Nomination = {
  id: number;
  title: string;
  author: string;
  reviewLink: string | null;
  coverUrl: string | null;
  rolloverCount: number;
  pitches: Pitch[];
};

function headStart(pitchCount: number): number {
  if (pitchCount >= 3) return 3;
  if (pitchCount === 2) return 2;
  return 0;
}

export default function VoteForm({
  nominations,
  currentUser,
  initialPoints,
  initialVeto,
  onSubmit,
}: {
  nominations: Nomination[];
  currentUser: string;
  initialPoints: Record<number, number>;
  initialVeto: number | null;
  /** Optional override — if provided, this runs instead of the real /api/votes
   * call. Used by the demo route so this exact component can run against local
   * fixture state instead of the production database. */
  onSubmit?: (
    points: Record<number, number>,
    vetoNominationId: number | null
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [points, setPoints] = useState<Record<number, number>>(initialPoints);
  const [vetoId, setVetoId] = useState<number | null>(initialVeto);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const used = vetoId !== null ? 0 : Object.values(points).reduce((a, b) => a + b, 0);
  const remaining = 3 - used;

  function setPts(nomId: number, delta: number) {
    setSaved(false);
    setPoints((prev) => {
      const current = prev[nomId] ?? 0;
      const next = Math.max(0, current + delta);
      if (delta > 0 && remaining <= 0) return prev;
      return { ...prev, [nomId]: next };
    });
  }

  function toggleVeto(nomId: number) {
    setSaved(false);
    setVetoId((prev) => {
      if (prev === nomId) return null;
      setPoints({});
      return nomId;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const result = onSubmit
      ? await onSubmit(points, vetoId)
      : await (async () => {
          const res = await fetch('/api/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points, vetoNominationId: vetoId }),
          });
          const data = await res.json().catch(() => ({}));
          return res.ok ? { ok: true as const } : { ok: false as const, error: data.error || 'Something went wrong.' };
        })();

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    if (!onSubmit) router.refresh();
  }

  const canSubmit = vetoId !== null || used > 0;

  return (
    <div>
      {nominations.map((n) => {
        const isOwn = n.pitches.some((p) => p.nominator === currentUser);
        const myPts = points[n.id] ?? 0;
        const isVetoTarget = vetoId === n.id;
        const pointsDisabledByVeto = vetoId !== null && !isVetoTarget;
        const hs = headStart(n.pitches.length);

        return (
          <div key={n.id} className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden">
            <div className="flex gap-3.5 p-4">
              <Cover title={n.title} coverUrl={n.coverUrl} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[16px]">{n.title}</h3>
                <div className="text-xs text-muted uppercase mb-1.5">{n.author}</div>
                {n.pitches.map((p, i) => (
                  <p key={i} className="text-sm mb-1">
                    {n.pitches.length > 1 && (
                      <span className="text-[10.5px] font-bold text-moss-dark uppercase mr-1.5">
                        Pitch {i + 1}
                      </span>
                    )}
                    {p.blurb}
                  </p>
                ))}
                <div className="flex gap-2.5 items-center mt-2 text-[11.5px]">
                  {n.pitches.length > 1 && (
                    <span className="bg-moss-tint text-moss-dark font-bold px-2.5 py-0.5 rounded-full">
                      {n.pitches.length === 2 ? 'Double' : 'Triple'} nomination · starts at {hs} pts
                    </span>
                  )}
                  {n.rolloverCount > 0 && (
                    <span className="bg-apricot-tint text-apricot-dark font-bold px-2.5 py-0.5 rounded-full">
                      Rollover {n.rolloverCount}/2
                    </span>
                  )}
                  {n.reviewLink && (
                    <a href={n.reviewLink} target="_blank" className="text-moss-dark underline">
                      Review link ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-border px-4 py-3 bg-[#FCFBF8] flex items-center justify-between gap-3 flex-wrap">
              {isOwn ? (
                <span className="text-[12.5px] text-muted-2 italic w-full text-center">
                  Your nomination — no self-voting.
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-2 uppercase mr-0.5">Points</span>
                  <button
                    onClick={() => setPts(n.id, -1)}
                    disabled={myPts <= 0 || pointsDisabledByVeto}
                    className="w-[30px] h-[30px] rounded-md border border-border bg-card text-moss-dark font-bold disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="font-bold text-lg w-[18px] text-center">{myPts}</span>
                  <button
                    onClick={() => setPts(n.id, 1)}
                    disabled={remaining <= 0 || pointsDisabledByVeto}
                    className="w-[30px] h-[30px] rounded-md border border-border bg-card text-moss-dark font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                  <div className="w-px h-[22px] bg-border mx-1" />
                  <button
                    onClick={() => toggleVeto(n.id)}
                    disabled={vetoId !== null && !isVetoTarget}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 ${
                      isVetoTarget
                        ? 'bg-danger text-white border-danger'
                        : 'bg-transparent text-danger border-danger'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="9" />
                      <line x1="5.8" y1="18.2" x2="18.2" y2="5.8" />
                    </svg>
                    Veto
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="sticky bottom-0 bg-card border border-border rounded-xl shadow-card p-3.5 mt-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          Points remaining: <b className="text-moss-dark text-base">{vetoId !== null ? 0 : remaining}</b> / 3
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
            saved ? 'bg-apricot-dark' : 'bg-moss hover:bg-moss-dark'
          }`}
        >
          {submitting ? 'Saving…' : saved ? 'Vote saved ✓' : 'Submit vote'}
        </button>
      </div>
      {error && <p className="text-danger text-sm mt-2">{error}</p>}
    </div>
  );
}
