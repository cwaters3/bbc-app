'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../../top-nav';
import VoteForm from '../../vote-form';
import { DEMO_CLUB_NAME, DEMO_CHAPTER_NUMBER, DEMO_VOTE_NOMINATIONS, DEMO_VIEWER } from '@/lib/demo/fixtures';
import { useDemoCovers, coverKey } from '@/lib/demo/useDemoCovers';

export default function DemoVotePage() {
  const [resetKey, setResetKey] = useState(0);
  const covers = useDemoCovers(DEMO_VOTE_NOMINATIONS);
  const nominationsWithCovers = DEMO_VOTE_NOMINATIONS.map((n) => ({
    ...n,
    coverUrl: covers[coverKey(n.title, n.author)] ?? n.coverUrl,
  }));

  async function handleSubmit() {
    return { ok: true as const };
  }

  return (
    <div>
      <div className="bg-apricot-tint text-apricot-dark text-center text-xs font-semibold py-1.5">
        🎭 Demo — fictional data, nothing here is saved
      </div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">{DEMO_CLUB_NAME}</h1>
      </div>
      <TopNav active="Vote" chapterNumber={DEMO_CHAPTER_NUMBER} basePath="/demo" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <div className="flex items-start gap-2.5 bg-apricot-tint border-l-4 border-apricot-dark rounded-md p-3.5 mb-4 text-sm">
          <span>🎉</span>
          <div className="flex-1">All nominations revealed — cast your points or veto below.</div>
        </div>

        <VoteForm
          key={resetKey}
          nominations={nominationsWithCovers}
          currentUser={DEMO_VIEWER}
          initialPoints={{}}
          initialVeto={null}
          onSubmit={handleSubmit}
        />

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="text-xs font-semibold text-muted-2 hover:text-ink"
          >
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
