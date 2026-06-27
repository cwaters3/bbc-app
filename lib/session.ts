import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from './auth';
import type { Member } from './members';

/** Use in Server Components / Route Handlers. Middleware already guarantees
 * a valid session on protected routes, but pages still need to know *who*
 * is logged in (to attribute nominations/votes, show "logged in as", etc). */
export async function getCurrentMember(): Promise<Member | null> {
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(cookie);
}
