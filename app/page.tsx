import { getCurrentMember } from '@/lib/session';
import { HOST } from '@/lib/members';
import LogoutButton from './logout-button';

export default async function HomePage() {
  const member = await getCurrentMember();

  return (
    <div className="min-h-screen px-4 py-10 max-w-xl mx-auto">
      <h1 className="font-display text-moss-dark text-4xl text-center mb-2">
        The Boys Book Club
      </h1>
      <p className="text-center text-muted text-sm mb-8">
        Logged in as <b className="text-ink">{member}</b>
        {member === HOST && (
          <span className="ml-2 inline-block bg-moss-tint text-moss-dark text-xs font-semibold px-2 py-0.5 rounded-full">
            Host
          </span>
        )}
      </p>

      <div className="bg-card border border-border rounded-xl shadow-card p-5 text-sm text-muted">
        <p className="mb-2">
          <b className="text-ink">Phase 1 checkpoint:</b> auth + database scaffolding are wired
          up. Nominate, Vote, Results, and History pages with real data come in the next
          phases.
        </p>
        <p>
          Want to poke at the fully interactive demo with mock data in the meantime?{' '}
          <a href="/demo" className="text-moss-dark underline">
            Open the demo →
          </a>
        </p>
      </div>

      <LogoutButton />
    </div>
  );
}
