'use client';

import type { HeatStatus } from '@/lib/types';

interface HeatBadgeProps {
  status: HeatStatus;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG: Record<
  HeatStatus,
  {
    emoji: string;
    label: string;
    className: string;
  }
> = {
  rising: {
    emoji: '\uD83D\uDD25',
    label: '급상승',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
  steady: {
    emoji: '\uD83D\uDCC8',
    label: '꾸준',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  cooling: {
    emoji: '\u2744\uFE0F',
    label: '하락',
    className: 'bg-stone-50 text-stone-500 border-stone-200',
  },
  new: {
    emoji: '\u2728',
    label: '신규',
    className: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
};

export default function HeatBadge({ status, size = 'sm' }: HeatBadgeProps) {
  const config = BADGE_CONFIG[status];

  const sizeClasses =
    size === 'md'
      ? 'px-3.5 py-1.5 text-sm gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${sizeClasses} ${config.className}`}
    >
      <span className={size === 'md' ? 'text-base' : 'text-sm'}>{config.emoji}</span>
      {config.label}
    </span>
  );
}
