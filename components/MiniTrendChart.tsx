'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HeatStatus } from '@/lib/types';

// ============================================================
// 30-day trend history generator (client-side simulation)
// ============================================================

export interface TrendHistoryPoint {
  date: string;       // display label "3/1"
  rawDate: string;    // ISO string
  social: number;
}

interface TrendInput {
  social_score: number;
  heat_status: HeatStatus;
}

/**
 * Deterministic pseudo-random using a simple seed hash.
 * Keeps generated curves stable across re-renders for the same trend.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s % 1000) / 1000;
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Generate a 30-day simulated curve for a single score.
 * Shape depends on heat_status.
 */
function generateCurve(
  currentScore: number,
  heatStatus: HeatStatus,
  rand: () => number,
): number[] {
  const days = 30;
  const values: number[] = new Array(days);

  switch (heatStatus) {
    case 'rising': {
      // Start low (30-50% of current), ramp up
      const startRatio = 0.3 + rand() * 0.2;
      const startVal = currentScore * startRatio;
      for (let i = 0; i < days; i++) {
        const t = i / (days - 1);
        // Ease-in curve (quadratic)
        const ease = t * t;
        const base = startVal + (currentScore - startVal) * ease;
        const noise = (rand() - 0.5) * currentScore * 0.08;
        values[i] = clamp(Math.round(base + noise), 0, 100);
      }
      break;
    }
    case 'steady': {
      // Fluctuate around current value
      for (let i = 0; i < days; i++) {
        const noise = (rand() - 0.5) * currentScore * 0.2;
        const drift = Math.sin((i / days) * Math.PI * 2) * currentScore * 0.06;
        values[i] = clamp(Math.round(currentScore + noise + drift), 0, 100);
      }
      break;
    }
    case 'cooling': {
      // Start high (130-160% of current), descend
      const startRatio = 1.3 + rand() * 0.3;
      const startVal = Math.min(currentScore * startRatio, 100);
      for (let i = 0; i < days; i++) {
        const t = i / (days - 1);
        // Ease-out curve
        const ease = 1 - (1 - t) * (1 - t);
        const base = startVal + (currentScore - startVal) * ease;
        const noise = (rand() - 0.5) * currentScore * 0.08;
        values[i] = clamp(Math.round(base + noise), 0, 100);
      }
      break;
    }
    case 'new': {
      // Near zero for first ~10 days, then rapid rise
      const riseStart = 8 + Math.floor(rand() * 5); // day 8-12
      for (let i = 0; i < days; i++) {
        if (i < riseStart) {
          // Very low or zero
          values[i] = clamp(Math.round(rand() * 8), 0, 100);
        } else {
          const t = (i - riseStart) / (days - 1 - riseStart);
          const ease = t * t; // fast ramp
          const base = currentScore * ease;
          const noise = (rand() - 0.5) * currentScore * 0.1;
          values[i] = clamp(Math.round(base + noise), 0, 100);
        }
      }
      break;
    }
  }

  // Ensure last value matches current score exactly
  values[days - 1] = currentScore;
  return values;
}

/**
 * Generate 30-day history data points for social_score only.
 * Uses a hash of the score as seed for deterministic results.
 */
export function generateTrendHistory(trend: TrendInput): TrendHistoryPoint[] {
  const seed = trend.social_score * 251 +
    (trend.heat_status === 'rising' ? 1 : trend.heat_status === 'steady' ? 2 : trend.heat_status === 'cooling' ? 3 : 4) * 997;

  const randSocial = seededRandom(seed + 7919);
  const socialCurve = generateCurve(trend.social_score, trend.heat_status, randSocial);

  const now = new Date();
  const points: TrendHistoryPoint[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    points.push({
      date: label,
      rawDate: d.toISOString(),
      social: socialCurve[i],
    });
  }

  return points;
}

// ============================================================
// Mini Trend Chart Component
// ============================================================

/** Real DB history point from /api/trend-history */
export interface TrendHistoryApiPoint {
  date: string;          // e.g. "2026-02-20"
  social_score: number;
}

interface MiniTrendChartProps {
  trend: TrendInput;
  /** Real DB history data. When provided, overrides simulation. */
  historyData?: TrendHistoryApiPoint[];
  height?: number;
  theme?: 'light' | 'dark';
}

interface MiniTooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  payload: TrendHistoryPoint;
}

function MiniTooltip({
  active,
  payload,
  colorMode = 'light',
}: {
  active?: boolean;
  payload?: MiniTooltipPayloadEntry[];
  colorMode?: 'light' | 'dark';
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const d = new Date(point.rawDate);
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

  const isDark = colorMode === 'dark';

  return (
    <div className={`rounded-lg px-3 py-2 shadow-sm border ${
      isDark
        ? 'bg-black/80 border-white/10 backdrop-blur-sm'
        : 'bg-white border-[#e5e5e5]'
    }`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
        isDark ? 'text-white/50' : 'text-stone-400'
      }`}>
        {dateStr}
      </p>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-stone-500'}`}>
              관심도
            </span>
            <span className={`text-[11px] font-bold ml-auto ${isDark ? 'text-white/90' : 'text-[#0a0a0a]'}`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Convert real DB history points to chart-compatible TrendHistoryPoint[].
 */
function mapApiHistory(points: TrendHistoryApiPoint[]): TrendHistoryPoint[] {
  return points.map((p) => {
    const d = new Date(p.date);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      date: label,
      rawDate: new Date(p.date).toISOString(),
      social: p.social_score,
    };
  });
}

export default function MiniTrendChart({ trend, historyData, height = 88, theme = 'light' }: MiniTrendChartProps) {
  const data = useMemo(() => {
    // Use real DB data when available (non-empty array)
    if (historyData && historyData.length > 0) {
      return mapApiHistory(historyData);
    }
    // Fallback to simulation
    return generateTrendHistory(trend);
  }, [trend, historyData]);
  const isDark = theme === 'dark';

  // Unique gradient ID to avoid clashes when multiple cards render
  const socialGradId = useMemo(
    () => `miniSocial_${trend.social_score}`,
    [trend.social_score],
  );

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-[3px] rounded-full bg-[#4f46e5]" />
          <span className={`text-[10px] font-semibold tracking-wide ${
            isDark ? 'text-white/40' : 'text-stone-400'
          }`}>
            💬 관심도
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <defs>
            <linearGradient id={socialGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={isDark ? 0.25 : 0.15} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: isDark ? 'rgba(255,255,255,0.3)' : '#a8a29e', fontWeight: 500 }}
            interval={6}
            dy={4}
          />

          <Tooltip
            content={<MiniTooltip colorMode={theme} />}
            cursor={{
              stroke: isDark ? 'rgba(255,255,255,0.15)' : '#e7e5e4',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />

          <Area
            type="monotone"
            dataKey="social"
            stroke="#4f46e5"
            strokeWidth={1.5}
            fill={`url(#${socialGradId})`}
            dot={false}
            activeDot={{
              r: 3,
              fill: '#4f46e5',
              stroke: isDark ? '#1a1a2e' : 'white',
              strokeWidth: 1.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
