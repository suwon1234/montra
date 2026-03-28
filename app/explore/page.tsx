'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

import Navigation from '@/components/Navigation';

/** API /api/countries 응답 아이템 */
interface CountryItem {
  code: string;
  name_ko: string;
  name_en: string;
  flag_emoji: string;
  region: string;
  rising_count: number;
  total_trends: number;
  top_trend?: string;
}

export default function ExplorePage() {
  const [countries, setCountries] = useState<CountryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/countries');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setCountries(json.data ?? []);
      } catch (err) {
        console.error('[ExplorePage] fetch failed:', err);
        if (!cancelled) setCountries([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#0a0a0a] font-sans">
      {/* 공통 네비게이션 */}
      <Navigation />

      {/* ========== Hero ========== */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-8">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#0a0a0a] transition-colors mb-6 group"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">홈으로</span>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="text-4xl">
            🌍
          </span>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0a0a0a] mb-1">
              국가 탐색
            </h1>
            <p className="text-sm text-stone-400 font-medium">
              Explore Countries
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm text-stone-500 leading-relaxed"
        >
          트렌드를 확인할 국가를 선택하세요. 각 국가의 실시간 트렌드 데이터를 살펴볼 수 있습니다.
        </motion.p>
      </div>

      {/* ========== Country Grid ========== */}
      <div className="max-w-2xl mx-auto px-5 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {countries.map((country, i) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.25 + i * 0.07,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Link
                href={`/country/${country.code.toLowerCase()}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full">
                  {/* Flag */}
                  <div className="text-3xl md:text-4xl mb-4 group-hover:scale-105 transition-transform duration-300">
                    {country.flag_emoji}
                  </div>

                  {/* Country name */}
                  <h2 className="text-lg font-bold text-[#0a0a0a] tracking-tight mb-1 group-hover:text-[#4f46e5] transition-colors">
                    {country.name_ko}
                  </h2>
                  <p className="text-xs text-stone-400 font-medium mb-4">
                    {country.name_en}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#f5f5f4] text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {country.total_trends}개 트렌드
                    </span>
                    {country.rising_count > 0 && (
                      <span className="bg-red-50 text-red-500 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {country.rising_count}
                      </span>
                    )}
                  </div>

                  {/* Top trend */}
                  {country.top_trend && (
                    <div className="pt-3 border-t border-[#e5e5e5]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        TOP
                      </span>
                      <p className="text-sm font-semibold text-stone-700 truncate mt-0.5">
                        {country.top_trend}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ========== 하단 홈 링크 ========== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#0a0a0a] transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
