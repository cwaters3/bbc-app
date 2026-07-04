'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HostAdvanceButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`${label}? This affects all 9 members.`)) return;
    setLoading(true);
    const res = await fetch('/api/cycles/advance', { method: 'POST' });
    setLoading(false);
    if (res.ok) {
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
      {loading ? 'Working…' : label}
    </button>
  );
}
