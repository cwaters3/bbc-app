'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
      }}
      className="mt-6 text-sm text-muted underline"
    >
      Log out
    </button>
  );
}
