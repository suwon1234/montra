'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

import { MOCK_CATEGORIES } from '@/lib/mock-data';
import type { CategorySlug, Category, TrendWithDetails } from '@/lib/types';
import TrendCard from '@/components/TrendCard';
import Navigation from '@/components/Navigation';
import { useTrendHistory } from '@/hooks/useTrendHistory';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  fashion: '전 세계 패션 카테고리 트렌드를 한눈에 비교하세요',
  products: '글로벌 인기 상품 트렌드를 국가별로 살펴보세요',
  food: '각 나라의 핫한 푸드 트렌드를 발견하세요',
  brands: '세계 각국의 핫한 브랜드 트렌드를 살펴보세요',
  challenge: '전 세계 바이럴 챌린지 트렌드를 만나보세요',
};

/** API /api/trends 응답 아이템 */
interface ApiTrendItem {
  id: string;
  country: { code: string; name_ko: string; name_en: string; flag_emoji: string };
  category: { slug: string; name_ko: string; name_en: string; emoji: string };
  name: string;
  description?: string;
  heat_score: number;
  heat_status: string;
  tags: string[];
  last_updated_at: string;
}

/** API /api/countries 응답 아이템 */
interface ApiCountryItem {
  code: string;
  name_ko: string;
  name_en: string;
  flag_emoji: string;
  region: string;
  rising_count: number;
  total_trends: number;
  top_trend?: string;
}

/** API 응답을 TrendWithDetails 형태로 변환 (TrendCard 호환) */
function apiTrendToTrendWithDetails(t: ApiTrendItem): TrendWithDetails {
  return {
    id: t.id,
    country_id: '',
    category_id: '',
    name: t.name,
    description: t.description,
    heat_score: t.heat_score,
    heat_status: t.heat_status as TrendWithDetails['heat_status'],
    search_score: 0,
    social_score: 0,
    ecommerce_score: 0,
    news_score: 0,
    tags: t.tags ?? [],
    source_urls: [],
    first_detected_at: t.last_updated_at,
    last_updated_at: t.last_updated_at,
    created_at: t.last_updated_at,
    country: t.country,
    category: {
      slug: t.category.slug as CategorySlug,
      name_ko: t.category.name_ko,
      name_en: t.category.name_en,
      emoji: t.category.emoji,
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);

  const [category, setCategory] = useState<Category | null>(null);
  const [groupedByCountry, setGroupedByCountry] = useState<
    {
      country: { code: string; name_ko: string; flag_emoji: string };
      trends: TrendWithDetails[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const foundCategory = MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;

        const [trendsRes, countriesRes] = await Promise.all([
          fetch(`/api/trends?category=${slug}&limit=100`),
          fetch('/api/countries'),
        ]);

        if (cancelled) return;

        setCategory(foundCategory);

        let trends: TrendWithDetails[] = [];
        let countries: ApiCountryItem[] = [];

        if (trendsRes.ok) {
          const trendsJson = await trendsRes.json();
          trends = (trendsJson.data ?? []).map(apiTrendToTrendWithDetails);
        }

        if (countriesRes.ok) {
          const countriesJson = await countriesRes.json();
          countries = countriesJson.data ?? [];
        }

        const groups: typeof groupedByCountry = [];
        countries.forEach((country) => {
          const countryTrends = trends.filter(
            (t) => t.country.code === country.code
          );
          if (countryTrends.length > 0) {
            groups.push({
              country: {
                code: country.code,
                name_ko: country.name_ko,
                flag_emoji: country.flag_emoji,
              },
              trends: countryTrends.sort(
                (a, b) => b.heat_score - a.heat_score
              ),
            });
          }
        });
        setGroupedByCountry(groups);
      } catch (err) {
        console.error('[CategoryPage] fetch failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Collect all trend IDs across country groups for batch history fetch
  const allTrendIds = useMemo(
    () => groupedByCountry.flatMap(g => g.trends.map(t => t.id)),
    [groupedByCountry]
  );
  const { historyMap } = useTrendHistory(allTrendIds);

  const totalTrends = groupedByCountry.reduce(
    (sum, g) => sum + g.trends.length,
    0
  );

  if (loading) return null;

  // 유효하지 않은 카테고리
  if (!category) {
    return (
      <main className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="text-4xl mb-6">📂</div>
          <h1 className="text-2xl font-extrabold text-[#0a0a0a] mb-2 tracking-tight">
            카테고리를 찾을 수 없습니다
          </h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            요청하신 카테고리가 존재하지 않습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-stone-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#0a0a0a] font-sans">
      {/* 공통 네비게이션 */}
      <Navigation />

      {/* ========== Hero ========== */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-8">
        {/* Category info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="text-4xl">
            {category.emoji}
          </span>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0a0a0a] mb-1">
              {category.name_ko} 트렌드
            </h1>
            <p className="text-sm text-stone-400 font-medium">
              {category.name_en}
            </p>
          </div>
        </motion.div>

        {/* Description + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            {CATEGORY_DESCRIPTIONS[slug] ?? ''}
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-400 font-medium">
            <span className="bg-[#f5f5f4] rounded-full px-3 py-1">
              {groupedByCountry.length}개국
            </span>
            <span className="bg-[#f5f5f4] text-[#0a0a0a] rounded-full px-3 py-1 font-semibold">
              {totalTrends}개 트렌드
            </span>
          </div>
        </motion.div>
      </div>

      {/* ========== Country Groups ========== */}
      <div className="max-w-2xl mx-auto px-5 pb-12">
        {groupedByCountry.length > 0 ? (
          <div className="flex flex-col gap-10">
            {groupedByCountry.map((group, gi) => (
              <motion.section
                key={group.country.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + gi * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {/* Country header */}
                <Link
                  href={`/country/${group.country.code.toLowerCase()}`}
                  className="inline-flex items-center gap-3 mb-5 group"
                >
                  <span className="text-3xl">{group.country.flag_emoji}</span>
                  <h2 className="text-xl font-bold text-[#0a0a0a] tracking-tight group-hover:text-[#4f46e5] transition-colors">
                    {group.country.name_ko}
                  </h2>
                  <span className="text-xs text-stone-400 font-medium bg-[#f5f5f4] rounded-full px-2.5 py-0.5">
                    {group.trends.length}개
                  </span>
                </Link>

                {/* Horizontal scroll trend cards */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {group.trends.map((trend, ti) => (
                    <motion.div
                      key={trend.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.4 + gi * 0.1 + ti * 0.06,
                      }}
                      className="min-w-[300px] max-w-[340px] shrink-0"
                    >
                      <Link href={`/trend/${trend.id}`}>
                        <TrendCard trend={trend} historyData={historyMap[trend.id]} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <div className="text-3xl mb-4">🔍</div>
            <p className="text-stone-400 text-sm font-medium">
              이 카테고리의 트렌드 데이터가 아직 없습니다
            </p>
          </motion.div>
        )}

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
            다른 카테고리 둘러보기
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
