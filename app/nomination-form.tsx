'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NominationForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [blurb, setBlurb] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch('/api/nominations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, blurb, reviewLink }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    setToast('Nomination submitted anonymously.');
    setTimeout(() => setToast(null), 4000);

    setTitle('');
    setAuthor('');
    setBlurb('');
    setReviewLink('');
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mb-4">
        {toast && (
          <div className="bg-moss-tint text-moss-dark text-sm rounded-md px-3 py-2 mb-2">
            {toast}
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-moss hover:bg-moss-dark text-white font-bold rounded-xl py-4 shadow-[0_4px_14px_-4px_rgba(92,122,92,0.55)] flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Submit your nomination
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm2"
    >
      <h3 className="font-semibold text-sm mb-3">New nomination</h3>

      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">Book title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Three-Body Problem"
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">Author</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Liu Cixin"
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">Why this book (1–2 sentences)</label>
        <textarea
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          maxLength={220}
          placeholder="Sell it to the room."
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm min-h-[54px]"
        />
        <div className="text-right text-[11px] text-muted-2 mt-0.5">{blurb.length}/220</div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">
          Review link (optional — Goodreads, StoryGraph, etc.)
        </label>
        <input
          value={reviewLink}
          onChange={(e) => setReviewLink(e.target.value)}
          placeholder="https://..."
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-moss hover:bg-moss-dark text-white font-semibold rounded-md px-4 py-2 text-sm disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit nomination'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted text-sm px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
