export default function Cover({ title, coverUrl }: { title: string; coverUrl: string | null }) {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={coverUrl}
        alt={title}
        className="flex-shrink-0 w-14 h-[78px] rounded object-cover shadow-inner"
      />
    );
  }
  return (
    <div className="flex-shrink-0 w-14 h-[78px] rounded bg-[#EFEDE6] flex items-center justify-center text-center text-[10px] font-semibold text-muted p-1 leading-tight">
      {title}
    </div>
  );
}
