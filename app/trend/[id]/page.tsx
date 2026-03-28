'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Calendar, CalendarCheck } from 'lucide-react';
import { motion } from 'motion/react';

import { getTrendById, getHistoryForTrend, getTrends } from '@/lib/data';
import type { TrendWithDetails } from '@/lib/types';
import TrendCard from '@/components/TrendCard';
import HeatBadge from '@/components/HeatBadge';
import HeatChart from '@/components/HeatChart';
import Navigation from '@/components/Navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-[#0a0a0a]';
  if (score >= 60) return 'text-stone-700';
  return 'text-stone-400';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const SOURCE_ITEMS = [
  { key: 'social_score' as const, label: '소셜 언급량', icon: MessageCircle, iconColor: 'text-stone-500' },
];

export default function TrendDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const [trend, setTrend] = useState<TrendWithDetails | null>(null);
  const [relatedTrends, setRelatedTrends] = useState<TrendWithDetails[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const trendData = await getTrendById(id);
        if (cancelled) return;
        setTrend(trendData);

        if (trendData) {
          const results = await Promise.allSettled([
            getHistoryForTrend(id),
            getTrends({ categorySlug: trendData.category.slug, limit: 4 }),
          ]);
          if (cancelled) return;

          // 히스토리 결과
          if (results[0].status === 'fulfilled') {
            setHasHistory(results[0].value.length > 0);
          } else {
            console.error('[TrendDetailPage] getHistoryForTrend failed:', results[0].reason);
            setHasHistory(false);
          }

          // 관련 트렌드 결과
          if (results[1].status === 'fulfilled') {
            setRelatedTrends(
              results[1].value
                .filter((t) => t.id !== id)
                .slice(0, 3)
            );
          } else {
            console.error('[TrendDetailPage] getTrends failed:', results[1].reason);
            setRelatedTrends([]);
          }
        }
      } catch (err) {
        console.error('[TrendDetailPage] getTrendById failed:', err);
        if (!cancelled) setTrend(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return null;

  // Trend not found
  if (!trend) {
    return (
      <main className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="text-4xl mb-6">🔍</div>
          <h1 className="text-2xl font-extrabold text-[#0a0a0a] mb-2 tracking-tight">
            트렌드를 찾을 수 없습니다
          </h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            요청하신 트렌드가 존재하지 않거나
            <br />
            삭제되었을 수 있습니다.
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
        {/* Breadcrumb navigation */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 text-sm text-stone-400">
            <Link
              href={`/country/${trend.country.code.toLowerCase()}`}
              className="hover:text-[#0a0a0a] transition-colors font-medium"
            >
              {trend.country.flag_emoji} {trend.country.name_ko}
            </Link>
            <span className="text-stone-300">{'>'}</span>
            <Link
              href={`/category/${trend.category.slug}`}
              className="hover:text-[#0a0a0a] transition-colors font-medium"
            >
              {trend.category.emoji} {trend.category.name_ko}
            </Link>
          </div>
        </motion.div>

        {/* Large flat score display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="text-center">
            <span className={`text-7xl font-extrabold tabular-nums ${getScoreTextColor(trend.heat_score)}`}>
              {trend.heat_score}
            </span>
            <div className="mt-2">
              <HeatBadge status={trend.heat_status} size="md" />
            </div>
          </div>
        </motion.div>

        {/* Meta pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Link
            href={`/country/${trend.country.code.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 bg-white border border-[#e5e5e5] rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:border-stone-300 hover:text-[#0a0a0a] transition-colors"
          >
            <span className="text-sm">{trend.country.flag_emoji}</span>
            {trend.country.name_ko}
          </Link>
          <Link
            href={`/category/${trend.category.slug}`}
            className="inline-flex items-center gap-1.5 bg-white border border-[#e5e5e5] rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:border-stone-300 hover:text-[#0a0a0a] transition-colors"
          >
            <span className="text-sm">{trend.category.emoji}</span>
            {trend.category.name_ko}
          </Link>
        </motion.div>

        {/* Trend name */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0a0a0a] text-center mb-3"
        >
          {trend.name}
        </motion.h1>

        {/* Local name */}
        {trend.name_local && trend.name_local !== trend.name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-stone-400 text-center font-medium mb-4"
          >
            {trend.name_local}
          </motion.p>
        )}

        {/* Description */}
        {trend.description && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-base text-stone-600 leading-relaxed text-center max-w-lg mx-auto"
          >
            {trend.description}
          </motion.p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-12">
        {/* ========== Source Scores ========== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              소스별 점수
            </span>
            <div className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SOURCE_ITEMS.map(({ key, label, icon: Icon, iconColor }, i) => {
              const score = trend[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.06 }}
                  className="bg-white rounded-2xl border border-[#e5e5e5] p-4 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div>
                      <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                        {label}
                      </div>
                      <div className="text-xl font-extrabold text-[#0a0a0a]">
                        {score}
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4f46e5] animate-bar"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ========== Heat Score History Chart ========== */}
        {hasHistory && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-[#e5e5e5]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                30일간 Heat Score 변화
              </span>
              <div className="h-px flex-1 bg-[#e5e5e5]" />
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:shadow-sm transition-all duration-300">
              <HeatChart trendId={trend.id} height={220} />
            </div>
          </motion.div>
        )}

        {/* ========== Tags ========== */}
        {trend.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {trend.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#f5f5f4] text-stone-500 rounded-full px-4 py-1.5 text-sm font-medium border border-[#e5e5e5] hover:text-[#0a0a0a] transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========== Date Info ========== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] p-5 mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                  최초 감지
                </div>
                <div className="text-sm font-bold text-[#0a0a0a]">
                  {formatDate(trend.first_detected_at)}
                </div>
              </div>
            </div>
            {trend.peak_date && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-stone-500" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                    최고 기록일
                  </div>
                  <div className="text-sm font-bold text-[#0a0a0a]">
                    {formatDate(trend.peak_date)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ========== Related Trends ========== */}
        {relatedTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px flex-1 bg-[#e5e5e5]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                {trend.country.flag_emoji} 같은 국가의 다른 트렌드
              </span>
              <div className="h-px flex-1 bg-[#e5e5e5]" />
            </div>

            <div className="flex flex-col gap-4">
              {relatedTrends.map((rt, i) => (
                <motion.div
                  key={rt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.75 + i * 0.08,
                  }}
                >
                  <Link href={`/trend/${rt.id}`}>
                    <TrendCard trend={rt} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========== 하단 홈 링크 ========== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 text-center"
        >
          <Link
            href={`/country/${trend.country.code.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#0a0a0a] transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {trend.country.name_ko} 트렌드 더보기
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
