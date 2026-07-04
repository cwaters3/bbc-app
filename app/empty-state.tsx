import Link from 'next/link';

export default function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[55vh] px-6">
      <div className="w-16 h-16 rounded-full bg-apricot-tint flex items-center justify-center text-3xl mb-5">
        {icon}
      </div>
      <h2 className="font-bold text-[18px] text-ink mb-1.5">{title}</h2>
      {description && (
        <p className="text-sm text-muted max-w-[280px] leading-relaxed">{description}</p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-1.5 bg-moss text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm2"
        >
          {cta.label}
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
