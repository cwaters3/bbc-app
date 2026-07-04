'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortToggle({ current }: { current: 'date' | 'rating' }) {
  const router = useRouter();
  const params = useSearchParams();

  function setSort(sort: 'date' | 'rating') {
    const next = new URLSearchParams(params.toString());
    next.set('sort', sort);
    router.push(`/history?${next.toString()}`);
  }

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setSort('date')}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${
          current === 'date'
            ? 'bg-moss text-white border-moss'
            : 'bg-card text-muted border-border'
        }`}
      >
        Date read
      </button>
      <button
        onClick={() => setSort('rating')}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${
          current === 'rating'
            ? 'bg-moss text-white border-moss'
            : 'bg-card text-muted border-border'
        }`}
      >
        Top rated
      </button>
    </div>
  );
}
