'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { MontraMarket } from '@/lib/focus-markets';

interface CountryCardProps {
  market: MontraMarket;
  watch?: boolean;
  index?: number;
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 12 12" fill="none">
      <path
        d="M6 2L6 10M6 2L2.5 5.5M6 2L9.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CountryCard({ market, watch = false, index = 0 }: CountryCardProps) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const investigated = market.investigated ?? 0;
  const primaryCount = investigated > 0 ? investigated : market.verified;
  const primaryLabel = investigated > 0 ? '개 조사' : '개 검증';

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (typeof document !== 'undefined' && document.hidden) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, (index % 7) * 60);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    const tm = setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 1500);
    return () => {
      io.disconnect();
      clearTimeout(tm);
    };
  }, [index]);

  const initialStyle: CSSProperties = {
    opacity: 0,
    transform: 'translateY(24px)',
    transition:
      'opacity 600ms cubic-bezier(0.2,0.8,0.2,1), transform 600ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 280ms ease, border-color 280ms ease',
  };

  return (
    <a
      ref={cardRef}
      href={`/country/${market.code.toUpperCase()}`}
      className={`mt-card ${watch ? 'watch' : ''}`}
      data-cursor="hover"
      style={initialStyle}
    >
      <div className="card-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="flag"
          src={`https://flagcdn.com/w160/${market.code}.png`}
          alt={market.name_ko}
          loading="lazy"
        />
        {market.rising > 0 && (
          <span className="rising">
            <ArrowUp />
            상승 {market.rising}
          </span>
        )}
      </div>

      <div className="name-block">
        <div className="name-ko">{market.name_ko}</div>
        <div className="name-en">{market.name_en}</div>
      </div>

      <div className="chips">
        <span className="chip">{market.signal}</span>
        <span className="chip lane">{market.lane}</span>
      </div>

      <div className="divider" />

      <div className="footer">
        <div className="verified">
          <span className="num-big">{primaryCount}</span>
          <span>{primaryLabel}</span>
        </div>
        <div className="headline">
          {investigated > 0 ? `검증 ${market.verified}건` : market.headline}
          {investigated > 0 && market.headline ? ` · ${market.headline}` : ''}
        </div>
      </div>
    </a>
  );
}
