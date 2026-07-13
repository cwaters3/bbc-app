'use client';

import { useEffect, useState } from 'react';

export function coverKey(title: string, author: string) {
  return `${title}::${author}`;
}

/** Fetches real cover art for demo fixture books via /api/demo/cover, which
 * reuses the exact same lookup the real nomination flow uses (Open Library,
 * then Google Books as a fallback). Keyed by "title::author" so multiple
 * fixture items can share results. Falls back to the gray placeholder (no
 * entry in the returned map) on any failure — this never blocks or errors
 * the page, same as production. */
export function useDemoCovers(items: { title: string; author: string }[]): Record<string, string> {
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    items.forEach(async ({ title, author }) => {
      try {
        const res = await fetch(
          `/api/demo/cover?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.coverUrl && !cancelled) {
          setCovers((prev) => ({ ...prev, [coverKey(title, author)]: data.coverUrl }));
        }
      } catch {
        // Keep the placeholder — same as production behavior.
      }
    });

    return () => {
      cancelled = true;
    };
    // Fixture lists are static per page, so this only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return covers;
}
