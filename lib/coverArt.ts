/** Looks up a cover image for a book via Open Library. Returns null on no
 * match or any network issue — callers should treat that as "show the
 * placeholder," never as an error worth surfacing to the person nominating. */
export async function lookupCoverUrl(title: string, author: string): Promise<string | null> {
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
