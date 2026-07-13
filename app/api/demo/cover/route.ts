import { NextRequest, NextResponse } from 'next/server';
import { lookupCoverUrl } from '@/lib/coverArt';

// Public, read-only lookup used only by the /demo route's fixture pages —
// demo has no server component to run the real cover lookup in (it's all
// client-rendered against local fixture data), so this gives it a same-origin
// route to call instead, reusing the exact same lib/coverArt.ts logic the
// real nomination flow uses. No DB access, nothing user-specific.
export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title');
  const author = request.nextUrl.searchParams.get('author');

  if (!title || !author) {
    return NextResponse.json({ error: 'title and author are required' }, { status: 400 });
  }

  const coverUrl = await lookupCoverUrl(title, author);
  return NextResponse.json({ coverUrl });
}
