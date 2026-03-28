'use client';

import type { TrendWithDetails } from '@/lib/types';
import HeatBadge from './HeatBadge';
import MiniTrendChart from './MiniTrendChart';
import type { TrendHistoryApiPoint } from './MiniTrendChart';

interface TrendCardProps {
  trend: TrendWithDetails;
  /** Real DB history data for the 30-day chart. Falls back to simulation when absent. */
  historyData?: TrendHistoryApiPoint[];
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-[#0a0a0a]';
  if (score >= 60) return 'text-stone-700';
  return 'text-stone-400';
}

export default function TrendCard({ trend, historyData }: TrendCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-[#e5e5e5] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Top row: Score + Badge + Category */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Flat score number */}
          <span className={`text-3xl font-extrabold tabular-nums ${getScoreTextColor(trend.heat_score)}`}>
            {trend.heat_score}
          </span>
          <HeatBadge status={trend.heat_status} />
        </div>
        <span className="text-sm text-stone-400 font-medium flex items-center gap-1.5">
          <span className="text-base">{trend.category.emoji}</span>
          {trend.category.name_ko}
        </span>
      </div>

      {/* Challenge badge */}
      {(trend.category.slug === 'challenges' || trend.tags.includes('challenge')) && (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-orange-200 mb-2">
          <span className="text-xs">{'\uD83D\uDD25'}</span>
          챌린지
        </span>
      )}

      {/* Trend name */}
      <h3 className="text-lg font-bold text-[#0a0a0a] leading-snug tracking-tight mb-1">
        {trend.name}
      </h3>

      {/* Description */}
      {trend.description && (
        <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-2">
          {trend.description}
        </p>
      )}

      {/* Tags */}
      {trend.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trend.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="bg-[#f5f5f4] text-stone-500 rounded-full px-3 py-1 text-xs font-medium border border-[#e5e5e5] hover:text-[#0a0a0a] transition-colors duration-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 30-Day Mini Trend Chart (Social only) */}
      <div className="pt-3 border-t border-[#e5e5e5]">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            30일 추이
          </span>
        </div>
        <MiniTrendChart trend={trend} historyData={historyData} />
      </div>
    </div>
  );
}
