'use client';

import { useState } from 'react';

const STAR_PATH = 'M12 2.4 14.86 8.46 21.5 9.36 16.7 14.04 17.9 20.6 12 17.4 6.1 20.6 7.3 14.04 2.5 9.36 9.14 8.46 Z';

function StarSlot({ fill, onClickLeft, onClickRight, readonly }: {
  fill: number; // 0, 0.5, or 1
  onClickLeft?: () => void;
  onClickRight?: () => void;
  readonly?: boolean;
}) {
  return (
    <span className="relative inline-block w-5 h-5 flex-shrink-0">
      {/* Background star outline */}
      <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
        <path d={STAR_PATH} fill="none" stroke="#C98C5C" strokeWidth="1.3" />
      </svg>
      {/* Filled portion — clips at 50% for half star, 100% for full */}
      {fill > 0 && (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: fill === 0.5 ? '50%' : '100%' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d={STAR_PATH} fill="#C98C5C" />
          </svg>
        </span>
      )}
      {!readonly && (
        <>
          <button
            onClick={onClickLeft}
            className="absolute left-0 top-0 w-1/2 h-full"
            aria-label="Half star"
          />
          <button
            onClick={onClickRight}
            className="absolute right-0 top-0 w-1/2 h-full"
            aria-label="Full star"
          />
        </>
      )}
    </span>
  );
}

function Stars({ value, onRate, readonly }: {
  value: number;
  onRate?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <StarSlot
            key={i}
            fill={fill >= 1 ? 1 : fill >= 0.5 ? 0.5 : 0}
            readonly={readonly}
            onClickLeft={() => onRate?.(i - 0.5)}
            onClickRight={() => onRate?.(i)}
          />
        );
      })}
    </span>
  );
}

export function RatingDisplay({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-apricot-dark font-bold text-sm">{value.toFixed(1)}</span>
      <Stars value={value} readonly />
    </span>
  );
}

export function RatingInput({
  historyId,
  initial,
  onRate,
}: {
  historyId: number;
  initial: number | null;
  /** Optional override — if provided, this runs instead of the real /api/ratings
   * call. Used by the demo route so this exact component can run against local
   * fixture state instead of the production database. */
  onRate?: (stars: number) => Promise<void>;
}) {
  const [value, setValue] = useState<number>(initial ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleRate(stars: number) {
    // Toggle off if clicking the same value
    const next = value === stars ? 0 : stars;
    setValue(next);
    if (next === 0) return;
    setSaving(true);
    setSaved(false);

    if (onRate) {
      await onRate(next);
      setSaving(false);
      setSaved(true);
      return;
    }

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historyId, stars: next }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <span className="inline-flex items-center gap-2">
      {saving && <span className="text-xs text-muted-2">Saving…</span>}
      {saved && !saving && <span className="text-xs text-moss-dark">Saved</span>}
      <Stars value={value} onRate={handleRate} />
    </span>
  );
}
