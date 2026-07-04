'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MEMBERS, type Member } from '@/lib/members';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState<Member>(MEMBERS[0]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong.');
      return;
    }
    router.push(params.get('redirect') || '/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-xl shadow-card p-6"
      >
        <h1 className="font-display text-moss-dark text-3xl text-center mb-6">
          The Boys Book Club
        </h1>

        <label className="block text-xs text-muted mb-1">Who are you?</label>
        <select
          value={username}
          onChange={(e) => setUsername(e.target.value as Member)}
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm mb-4"
        >
          {MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="block text-xs text-muted mb-1">Club password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm mb-4"
          autoFocus
        />

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-moss hover:bg-moss-dark text-white font-semibold rounded-lg py-3 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
