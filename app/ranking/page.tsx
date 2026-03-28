'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

import type { HeatStatus } from '@/lib/types';
import HeatBadge from '@/components/HeatBadge';
import Navigation from '@/components/Navigation';

/** API /api/ranking 응답 아이템 */
interface RankedTrend {
  rank: number;
  country_code: string;
  country_flag: string;
  name: string;
  heat_score: number;
  heat_status: HeatStatus;
  category_slug: string;
  category_emoji: string;
}

export default function RankingPage() {
  const [rankedTrends, setRankedTrends] = useState<RankedTrend[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ranking?limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setRankedTrends(json.data ?? []);
      } catch (err) {
        console.error('[RankingPage] fetch failed:', err);
        if (!cancelled) setRankedTrends([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#0a0a0a] font-sans">
      {/* 공통 네비게이션 */}
      <Navigation />

      {/* 페이지 헤더 */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold tracking-tight">
          글로벌 트렌드 랭킹
        </h1>
        <p className="text-xs text-stone-400 font-medium mt-0.5">
          전 세계에서 가장 뜨거운 트렌드
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex flex-col gap-3">
          {rankedTrends.map((trend) => (
              <motion.div
                key={`${trend.rank}-${trend.name}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: (trend.rank - 1) * 0.04 }}
              >
                <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    {/* 순위 */}
                    <div className="shrink-0 w-9 text-center">
                      <span
                        className={`text-lg font-extrabold ${
                          trend.rank <= 3
                            ? 'text-[#0a0a0a]'
                            : 'text-stone-300'
                        }`}
                      >
                        #{trend.rank}
                      </span>
                    </div>

                    {/* 국기 + 트렌드 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{trend.country_flag}</span>
                        <span className="text-sm font-bold text-[#0a0a0a] truncate">
                          {trend.name}
                        </span>
                        <span className="shrink-0 text-sm">{trend.category_emoji}</span>
                      </div>

                      {/* 프로그레스 바 */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-stone-800 transition-all duration-500"
                            style={{ width: `${trend.heat_score}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-sm font-bold text-[#0a0a0a] tabular-nums w-8 text-right">
                          {trend.heat_score}
                        </span>
                      </div>
                    </div>

                    {/* HeatBadge */}
                    <div className="shrink-0 hidden sm:block">
                      <HeatBadge status={trend.heat_status} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* 하단 홈 링크 */}
        <div className="text-center mt-10 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#0a0a0a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
