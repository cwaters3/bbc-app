import Link from 'next/link';

const TABS = [
  { href: '/', label: 'Nominate', enabled: true },
  { href: '/vote', label: 'Vote', enabled: true },
  { href: '/results', label: 'Results', enabled: true },
  { href: '/history', label: 'History', enabled: true },
  { href: '/rules', label: 'Rules', enabled: true },
] as const;

export default function TopNav({
  active,
  chapterNumber,
  basePath = '',
}: {
  active: string;
  chapterNumber?: number;
  /** Prefix for tab links — used by the demo route to link within /demo/* instead
   * of the real app's routes. */
  basePath?: string;
}) {
  return (
    <div>
      {chapterNumber && (
        <div className="text-center pb-1">
          <span className="text-xs font-semibold text-muted-2 tracking-wide">
            Chapter {chapterNumber}
          </span>
        </div>
      )}
      <div className="flex justify-center gap-6 border-b border-border bg-bg pt-2.5 px-2 flex-wrap">
        {TABS.map((tab) =>
          tab.enabled ? (
            <Link
              key={tab.label}
              href={`${basePath}${tab.href === '/' ? '' : tab.href}` || '/'}
              className={`pb-3 text-sm font-medium border-b-2 ${
                active === tab.label
                  ? 'text-ink border-moss font-semibold'
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          ) : (
            <span
              key={tab.label}
              title="Coming soon"
              className="pb-3 text-sm font-medium text-muted-2 border-b-2 border-transparent cursor-not-allowed"
            >
              {tab.label}
            </span>
          )
        )}
      </div>
    </div>
  );
}
