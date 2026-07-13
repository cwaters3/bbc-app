/** Looks up a cover image for a book. Tries Open Library first, then falls
 * back to Google Books if Open Library has no match — Open Library's coverage
 * of newer or smaller-press titles is inconsistent, and Google Books tends to
 * fill in those gaps. Returns null if neither source has a match or either
 * request fails — callers should treat that as "show the placeholder," never
 * as an error worth surfacing to the person nominating. */
export async function lookupCoverUrl(title: string, author: string): Promise<string | null> {
  const fromOpenLibrary = await lookupOpenLibrary(title, author);
  if (fromOpenLibrary) return fromOpenLibrary;
  return lookupGoogleBooks(title, author);
}

async function lookupOpenLibrary(title: string, author: string): Promise<string | null> {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}&author=${encodeURIComponent(author)}&limit=1&fields=cover_i`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const coverId = data?.docs?.[0]?.cover_i;
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
  } catch {
    return null;
  }
}

async function lookupGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    // Quoting each value matters — without it, intitle:/inauthor: only bind
    // to the single word immediately following them, and the rest of a
    // multi-word title or author leaks out as unscoped search terms.
    const q = `intitle:"${title}" inauthor:"${author}"`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const thumbnail = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (!thumbnail) return null;
    // Google serves these over http by default — force https so it doesn't
    // get silently blocked as mixed content.
    return thumbnail.replace(/^http:/, 'https:');
  } catch {
    return null;
  }
}
