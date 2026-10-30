import { db } from './db';
import { nominations } from './db/schema';
import { eq } from 'drizzle-orm';

export type BookMeta = {
  publishedYear: number | null;
  pageCount: number | null;
};

type GoogleVolume = {
  volumeInfo?: {
    title?: string;
    publishedDate?: string;
    pageCount?: number;
  };
};

/**
 * Looks up publication year and page count from the Google Books API.
 *
 * Returns:
 *  - a BookMeta (possibly with null fields) when Google answered — "we asked"
 *  - null when the request itself failed (network error, 429, etc.), so the
 *    caller knows to try again on a later page load
 *
 * Year is the earliest publishedDate among results whose title matches, which
 * favors the original edition over later reissues. Page count comes from the
 * best-ranked matching result that has one.
 */
export async function lookupBookMeta(title: string, author: string): Promise<BookMeta | null> {
  try {
    const q = `intitle:${title} inauthor:${author}`;
    const key = process.env.GOOGLE_BOOKS_API_KEY; // optional — works without it at low volume
    const url =
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
      `&maxResults=10&printType=books${key ? `&key=${key}` : ''}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`bookMeta: Google Books returned ${res.status} for "${title}"`);
      return null;
    }

    const data = (await res.json()) as { items?: GoogleVolume[] };
    const items = data.items ?? [];

    const wanted = title.trim().toLowerCase();
    const matching = items.filter((i) => i.volumeInfo?.title?.toLowerCase().includes(wanted));
    const pool = matching.length > 0 ? matching : items;

    const years = pool
      .map((i) => parseInt(i.volumeInfo?.publishedDate?.slice(0, 4) ?? '', 10))
      .filter((y) => Number.isInteger(y) && y > 0);
    const publishedYear = years.length > 0 ? Math.min(...years) : null;

    const pageCount =
      pool.find((i) => (i.volumeInfo?.pageCount ?? 0) > 0)?.volumeInfo?.pageCount ?? null;

    return { publishedYear, pageCount };
  } catch (err) {
    console.error(`bookMeta: lookup failed for "${title}"`, err);
    return null;
  }
}

/**
 * Fills in year/page count for any nomination that hasn't been looked up yet,
 * saves the result, and returns the list with the new values merged in.
 * Handles fresh nominations, rollover copies, and older rows alike, so nothing
 * else in the app needs to know about metadata. A failed lookup leaves the row
 * untouched so it's retried on the next load; a successful lookup that finds
 * nothing is saved so it isn't repeated.
 */
export async function ensureBookMeta<
  T extends {
    id: number;
    title: string;
    author: string;
    publishedYear: number | null;
    pageCount: number | null;
    metaFetchedAt: Date | null;
  }
>(noms: T[]): Promise<T[]> {
  return Promise.all(
    noms.map(async (n) => {
      if (n.metaFetchedAt) return n;

      const meta = await lookupBookMeta(n.title, n.author);
      if (meta === null) return n;

      const fetchedAt = new Date();
      try {
        await db
          .update(nominations)
          .set({ ...meta, metaFetchedAt: fetchedAt })
          .where(eq(nominations.id, n.id));
      } catch (err) {
        console.error(`bookMeta: failed to save metadata for nomination ${n.id}`, err);
      }
      return { ...n, ...meta, metaFetchedAt: fetchedAt };
    })
  );
}
