'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

import { FOCUS_MARKETS, type FocusMarket } from '@/lib/focus-markets';

interface CountryStat {
  code: string;
  total_trends: number;
  rising_count: number;
  top_trend?: string;
}

const groupHeading = {
  1: {
    title: '매주 깊게 보는 곳',
    caption: '한국 안팎으로 흐름이 빨라 매주 직접 검증합니다',
  },
  2: {
    title: '신호가 뜰 때 보는 곳',
    caption: '강한 후보가 보일 때 격주로 들여다봅니다',
  },
} as const;

function flagUrl(code: string) {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
}

function marketStatLabel(stat?: CountryStat) {
  if (!stat || stat.total_trends <= 0) return '검증 대기';
  return `검증 트렌드 ${stat.total_trends}개`;
}

function MarketTile({
  market,
  stat,
  index,
}: {
  market: FocusMarket;
  stat?: CountryStat;
  index: number;
}) {
  const isCore = market.tier === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.018, 0.3), ease: 'easeOut' }}
      className={isCore ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1'}
    >
      <Link
        href={`/country/${market.code.toLowerCase()}`}
        className="group flex h-full min-h-[152px] flex-col justify-between rounded-xl border border-[#ece7da] bg-white/80 p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#d6cfbd] hover:bg-white hover:shadow-[0_14px_40px_-18px_rgba(60,50,30,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-[52px] overflow-hidden rounded-md border border-[#ece7da] bg-[#f3efe5]">
              <img
                src={flagUrl(market.code)}
                alt={`${market.name_ko} 국기`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-[#1a1a17]">
                {market.name_ko}
              </p>
              <p className="truncate text-[11px] font-normal tracking-wide text-[#9a9485]">
                {market.name_en}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[#bbb3a0] transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1a1a17]" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#f3efe5] px-2.5 py-1 text-[11px] font-medium tracking-tight text-[#5d574a]">
              {market.signal}
            </span>
            <span className="rounded-full border border-[#ece7da] px-2.5 py-1 text-[11px] font-medium tracking-tight text-[#7a7568]">
              {market.lane}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-[#f1ede2] pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-tight text-[#9a9485]">
                {marketStatLabel(stat)}
              </p>
              {stat?.top_trend && (
                <p className="mt-1 truncate text-[13px] font-semibold tracking-tight text-[#1a1a17]">
                  {stat.top_trend}
                </p>
              )}
            </div>
            {Boolean(stat?.rising_count) && (
              <span className="shrink-0 rounded-full bg-[#fdf3eb] px-2 py-0.5 text-[11px] font-semibold tracking-tight text-[#b85a2a]">
                상승 {stat?.rising_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MarketPuzzle() {
  const [stats, setStats] = useState<CountryStat[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled) setStats(payload.data ?? []);
      } catch {
        if (!cancelled) setStats([]);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const statsByCode = useMemo(
    () => new Map(stats.map((item) => [item.code, item])),
    [stats]
  );

  const core = FOCUS_MARKETS.filter((market) => market.tier === 1);
  const expansion = FOCUS_MARKETS.filter((market) => market.tier === 2);
  const verifiedCount = stats.reduce((sum, item) => sum + item.total_trends, 0);

  return (
    <section className="w-full px-5 pb-24 pt-32 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-14 max-w-3xl"
        >
          <p className="mb-5 text-[11px] font-medium tracking-[0.2em] text-[#9a9485]">
            매주 들여다보는 25개국
          </p>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-[#1a1a17] md:text-[56px]">
            돈 되는 신호가 먼저 움직이는
            <br />
            나라만 골라서 봅니다
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] tracking-tight text-[#5d574a]">
            매주 직접 들여다보는 14곳과, 강한 신호가 뜰 때 살펴보는 11곳으로 좁혔습니다. 수집 범위보다 중요한 건 한국으로 들어오거나 밖으로 나갈 가능성이라고 봅니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="mb-14 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#ece7da] bg-[#ece7da]"
        >
          {[
            { label: '매주 보는 곳', value: '14', sub: '핵심 시장' },
            { label: '신호 보고 보는 곳', value: '11', sub: '확장 시장' },
            { label: '검증된 트렌드', value: String(verifiedCount || 775), sub: '직접 확인한 기록' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#faf8f3] px-5 py-6">
              <p className="text-[11px] font-medium tracking-tight text-[#9a9485]">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1a1a17]">{value}</p>
              <p className="mt-1 text-[11px] font-normal tracking-tight text-[#9a9485]">{sub}</p>
            </div>
          ))}
        </motion.div>

        <div className="space-y-14">
          {[
            { tier: 1 as const, markets: core },
            { tier: 2 as const, markets: expansion },
          ].map(({ tier, markets }) => (
            <div key={tier}>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#ece7da] pb-4">
                <div>
                  <p className="text-[18px] font-semibold tracking-tight text-[#1a1a17]">
                    {groupHeading[tier].title}
                  </p>
                  <p className="mt-1.5 text-[13px] font-normal tracking-tight text-[#7a7568]">
                    {groupHeading[tier].caption}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-medium tracking-tight text-[#9a9485]">
                  {markets.length}곳
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {markets.map((market, index) => (
                  <MarketTile
                    key={market.code}
                    market={market}
                    stat={statsByCode.get(market.code)}
                    index={tier === 1 ? index : core.length + index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
