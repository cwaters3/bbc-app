'use client';

import { useState } from 'react';
import NominationForm, { type NominationInput, type SubmitResult } from './nomination-form';

export type MyNomination = {
  title: string;
  author: string;
  blurb: string;
  reviewLink: string | null;
};

/**
 * Owns the three states of the Nominate page's submission area:
 *  1. no nomination yet      → the normal form
 *  2. nomination submitted   → a status card (replaces the form)
 *  3. changing nomination    → the same form, with a heads-up banner
 *
 * `onSubmit` is the demo-route override, forwarded straight to NominationForm.
 */
export default function NominationPanel({
  existing,
  onSubmit,
}: {
  existing: MyNomination | null;
  onSubmit?: (input: NominationInput) => Promise<SubmitResult>;
}) {
  const [changing, setChanging] = useState(false);
  // Shown immediately after a submit so the card appears without waiting on the
  // server refresh; the refreshed `existing` prop catches up right behind it.
  const [saved, setSaved] = useState<MyNomination | null>(null);
  const current = saved ?? existing;

  function handleSaved(input: NominationInput) {
    setSaved({
      title: input.title.trim(),
      author: input.author.trim(),
      blurb: input.blurb.trim(),
      reviewLink: input.reviewLink.trim() || null,
    });
    setChanging(false);
  }

  if (!current) {
    return <NominationForm onSubmit={onSubmit} onSaved={handleSaved} />;
  }

  if (changing) {
    return (
      <NominationForm
        replacing={{ title: current.title }}
        onSubmit={onSubmit}
        onSaved={handleSaved}
        onCancel={() => setChanging(false)}
      />
    );
  }

  return (
    <div className="bg-moss-tint border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 text-moss-dark font-bold text-sm mb-2.5">
        <span>✅</span> Your nomination is in
      </div>
      <div className="bg-card border border-border rounded-lg px-3.5 py-3">
        <div className="font-bold text-[15px]">{current.title}</div>
        <div className="text-xs text-muted uppercase mb-1.5">{current.author}</div>
        <p className="text-sm">{current.blurb}</p>
      </div>
      <div className="flex items-center justify-between gap-3 mt-3 text-xs text-muted">
        <span>Hidden from everyone else until voting opens.</span>
        <button
          onClick={() => setChanging(true)}
          className="text-moss-dark underline font-semibold whitespace-nowrap"
        >
          Change my nomination
        </button>
      </div>
    </div>
  );
}
