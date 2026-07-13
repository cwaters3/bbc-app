'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../../top-nav';
import ResultsView from '../../results/results-view';
import {
  DEMO_CLUB_NAME,
  DEMO_CHAPTER_NUMBER,
  DEMO_RESULTS_NOMINATIONS,
  DEMO_RESULTS_VOTER_COUNTS,
  DEMO_RESULTS_HISTORY_ID,
} from '@/lib/demo/fixtures';

export default function DemoResultsPage() {
  const [myRating, setMyRating] = useState<number | null>(null);

  async function handleRate(stars: number) {
    setMyRating(stars);
  }

  return (
    <div>
      <div className="bg-apricot-tint text-apricot-dark text-center text-xs font-semibold py-1.5">
        🎭 Demo — fictional data, nothing here is saved
      </div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">{DEMO_CLUB_NAME}</h1>
      </div>
      <TopNav active="Results" chapterNumber={DEMO_CHAPTER_NUMBER} basePath="/demo" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <ResultsView
          nominations={DEMO_RESULTS_NOMINATIONS}
          voterCounts={DEMO_RESULTS_VOTER_COUNTS}
          historyId={DEMO_RESULTS_HISTORY_ID}
          myRating={myRating}
          onRate={handleRate}
        />

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-2">Demo mode</span>
          <Link href="/login" className="text-xs font-semibold text-moss-dark">
            Exit demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
