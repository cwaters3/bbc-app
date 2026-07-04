'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StartNextCycleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        'Start the next cycle? This will carry over 2nd and 3rd place books and open nomination week.'
      )
    )
      return;
    setLoading(true);
    const res = await fetch('/api/cycles/next', { method: 'POST' });
    setLoading(false);
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
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
      {loading ? 'Starting…' : 'Start next cycle →'}
    </button>
  );
}
