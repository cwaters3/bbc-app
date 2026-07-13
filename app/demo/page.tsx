'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../top-nav';
import Cover from '../cover';
import NominationForm, { type NominationInput } from '../nomination-form';
import {
  DEMO_CLUB_NAME,
  DEMO_CHAPTER_NUMBER,
  DEMO_NOMINATE_ROLLOVER,
  DEMO_NOMINATE_INITIAL_FRESH_COUNT,
} from '@/lib/demo/fixtures';

export default function DemoNominatePage() {
  const [freshCount, setFreshCount] = useState(DEMO_NOMINATE_INITIAL_FRESH_COUNT);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(_input: NominationInput) {
    setFreshCount((c) => c + 1);
    return { ok: true as const };
  }

  function handleReset() {
    setFreshCount(DEMO_NOMINATE_INITIAL_FRESH_COUNT);
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
      <TopNav active="Nominate" chapterNumber={DEMO_CHAPTER_NUMBER} basePath="/demo" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
          <span>📌</span>
          <div className="flex-1">
            Nominations stay hidden until voting opens. Full rules in the Rules tab.
          </div>
        </div>

        <NominationForm key={resetKey} onSubmit={handleSubmit} />

        <div className="text-[11px] uppercase tracking-wide text-muted-2 mb-2">
          Rolling over from last cycle
        </div>
        <div className="bg-card border border-border rounded-xl shadow-card mb-3.5 overflow-hidden">
          <div className="flex gap-3.5 p-4">
            <Cover title={DEMO_NOMINATE_ROLLOVER.title} coverUrl={DEMO_NOMINATE_ROLLOVER.coverUrl} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[16px]">{DEMO_NOMINATE_ROLLOVER.title}</h3>
              <div className="text-xs text-muted uppercase mb-1.5">{DEMO_NOMINATE_ROLLOVER.author}</div>
              <p className="text-sm">{DEMO_NOMINATE_ROLLOVER.pitches[0]?.blurb}</p>
              <div className="flex gap-2.5 items-center mt-2 text-[11.5px]">
                <span className="bg-apricot-tint text-apricot-dark font-bold px-2.5 py-0.5 rounded-full">
                  Rollover {DEMO_NOMINATE_ROLLOVER.rolloverCount}/2
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] uppercase tracking-wide text-muted-2 mb-2 mt-4">New this week</div>

        <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 text-sm">
          <span>👀</span>
          <div>
            <b>{freshCount}</b> new nomination{freshCount === 1 ? '' : 's'} submitted so far.
          </div>
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
