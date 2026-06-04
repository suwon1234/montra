'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { MontraMarket } from '@/lib/focus-markets';
import CountryHero, { type RaonNote } from './CountryHero';
import TreasureChest from './TreasureChest';
import FilterBar from './FilterBar';
import TrendCard, { type CountryTrendCard } from './TrendCard';
import InsightPanel from './InsightPanel';
import CountryFooter from './CountryFooter';

interface CountryShellProps {
  market: MontraMarket;
  trends: CountryTrendCard[];
  keywords: string[];
  note: RaonNote;
  totalTrends: number;
  totalRising: number;
  avgScore: number;
}

export default function CountryShell({
  market,
  trends,
  keywords,
  note,
  totalTrends,
  totalRising,
  avgScore,
}: CountryShellProps) {
  const [filter, setFilter] = useState('전체');
  const [chestOpen, setChestOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === '전체') return trends;
    if (filter === '상승') return trends.filter((t) => t.heatStatus === 'rising');
    const labelToSlug: Record<string, string> = {
      옷: 'fashion',
      상품: 'products',
      음식: 'food',
      브랜드: 'brands',
      챌린지: 'challenge',
    };
    const slug = labelToSlug[filter];
    if (!slug) return trends;
    return trends.filter((t) => t.categorySlug === slug);
  }, [filter, trends]);

  // Set page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${market.name_ko} · MONTRA 트렌드 신호`;
    }
  }, [market]);

  // Measure chest position relative to each card and set per-card --fox/--foy
  // so each card animates from inside the chest to its grid spot.
  useEffect(() => {
    if (!chestOpen) return;
    requestAnimationFrame(() => {
      const chest = document.querySelector('.c-discovery-stage .chest');
      const cards = document.querySelectorAll<HTMLElement>(
        '.c-discovery-stage .fly-slot > .c-trend-card'
      );
      if (!chest || !cards.length) return;
      const chestRect = chest.getBoundingClientRect();
      const ox = chestRect.left + chestRect.width / 2;
      const oy = chestRect.top + chestRect.height * 0.42;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = ox - cx;
        const dy = oy - cy;
        const rot = Math.max(
          -10,
          Math.min(10, dx * -0.02 + (i % 2 ? 4 : -4))
        );
        card.style.setProperty('--fox', `${dx}px`);
        card.style.setProperty('--foy', `${dy}px`);
        card.style.setProperty('--frot', `${rot}deg`);
        card.style.setProperty('--fd', `${0.32 + i * 0.06}s`);
      });
    });
  }, [chestOpen, filter]);

  return (
    <>
      <header className="c-header">
        <Link href="/" className="c-back">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          전체 25개국으로
        </Link>
        <div className="c-search">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input placeholder="이 나라에서 트렌드 찾기…" />
        </div>
        <span className="c-wordmark">MONTRA · {market.code.toUpperCase()}</span>
      </header>

      <CountryHero
        market={market}
        totalTrends={totalTrends}
        totalRising={totalRising}
        avgScore={avgScore}
        keywords={keywords}
        note={note}
      />

      <section className="c-discovery">
        <div className="chest-bg-dots" />
        <div className="chest-eyebrow">자, 보물상자 안에는 뭐가 있을까요?</div>
        <h2>
          이번 주 <span className="hl">{market.name_ko}</span> 발견!
        </h2>
        <p className="sub">
          라온이가 직접 골라 보물상자에 담아둔 트렌드 {trends.length}개. 상자를
          열면 그 안에서 하나씩 튀어나와요.
        </p>

        <div className="c-discovery-stage">
          <div className={`chest-stage-wrap ${chestOpen ? 'vanish' : ''}`}>
            <TreasureChest
              marketCode={market.code}
              marketLabel={market.code.toUpperCase()}
              onOpen={() => setChestOpen(true)}
            />
          </div>

          <div className={`unlock-only stage-filter ${chestOpen ? 'shown' : ''}`}>
            <FilterBar
              active={filter}
              setActive={setFilter}
              count={filtered.length}
            />
          </div>

          <div className={`unlock-only stage-trends-header ${chestOpen ? 'shown' : ''}`}>
            <div className="c-trends-header">
              <div>
                <h2 className="title">
                  CURATED <span className="hl">INTELLIGENCE</span>
                </h2>
                <p className="sub">
                  라온이가 매주 직접 검수한 신호만 모았어요. 점수가 높을수록 시장
                  진입 단계가 진행된 트렌드입니다.
                </p>
              </div>
            </div>
          </div>

          <div className={`c-trend-grid ${chestOpen ? 'unlocked' : 'locked'}`}>
            {filtered.map((t, i) => (
              <div key={`${t.title}-${i}`} className="fly-slot">
                <TrendCard trend={t} isFeatured={i === 0 && filter === '전체'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`c-after-discovery unlock-only ${chestOpen ? 'shown' : ''}`}>
        <InsightPanel market={market} />
      </div>

      <CountryFooter />
    </>
  );
}
