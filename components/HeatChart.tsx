'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getHistoryForTrend } from '@/lib/data';

interface HeatChartProps {
  trendId: string;
  height?: number;
}

interface ChartDataPoint {
  date: string;
  rawDate: string;
  score: number;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const d = new Date(data.rawDate);
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 shadow-sm">
      <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider mb-1">
        {dateStr}
      </p>
      <p className="text-lg font-extrabold text-[#0a0a0a]">
        {data.score}
      </p>
    </div>
  );
}

function CustomDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  dataLength: number;
}) {
  const { cx, cy, index, dataLength } = props;
  // Only render dot on the last data point
  if (index !== dataLength - 1) return null;
  return (
    <g>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={6} fill="rgba(79, 70, 229, 0.12)" />
      {/* Middle ring */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="white"
        stroke="#4f46e5"
        strokeWidth={2}
      />
      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={1.5} fill="#4f46e5" />
    </g>
  );
}

export default function HeatChart({ trendId, height = 240 }: HeatChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await getHistoryForTrend(trendId);
        if (!cancelled) {
          setChartData(
            history.map((h) => ({
              date: formatDateLabel(h.recorded_at),
              rawDate: h.recorded_at,
              score: h.heat_score,
            }))
          );
        }
      } catch (err) {
        console.error('[HeatChart] getHistoryForTrend failed:', err);
        if (!cancelled) setChartData([]);
      }
    })();
    return () => { cancelled = true; };
  }, [trendId]);

  if (chartData.length === 0) return null;

  const dataLength = chartData.length;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="heatAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
            <stop offset="60%" stopColor="#4f46e5" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 500 }}
          interval={6}
          dy={8}
        />

        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 500 }}
          tickCount={5}
          dx={-4}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: '#e5e5e5',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          }}
        />

        <Area
          type="monotone"
          dataKey="score"
          stroke="#4f46e5"
          strokeWidth={2}
          fill="url(#heatAreaGrad)"
          dot={(dotProps) => (
            <CustomDot
              key={dotProps.index}
              cx={dotProps.cx}
              cy={dotProps.cy}
              index={dotProps.index}
              dataLength={dataLength}
            />
          )}
          activeDot={{
            r: 4,
            fill: '#4f46e5',
            stroke: 'white',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
