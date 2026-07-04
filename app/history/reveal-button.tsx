'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RevealRatingsButton({ historyId }: { historyId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm('Reveal the BBC Overall rating for this book? This cannot be undone.')) return;
    setLoading(true);
    const res = await fetch('/api/history/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historyId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Something went wrong.');
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-semibold text-apricot-dark border border-apricot rounded-full px-3 py-1 disabled:opacity-50"
    >
      {loading ? 'Revealing…' : 'Reveal ratings'}
    </button>
  );
}
