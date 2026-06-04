'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import ChromaVideo from './ChromaVideo';
import Reveal from './Reveal';

interface FlagPos {
  code: string;
  style: CSSProperties;
}

interface HeroProps {
  refreshSummary?: {
    batchDate: string;
    countryCount: number;
    trendCount: number;
  } | null;
}

export default function Hero({ refreshSummary }: HeroProps) {
  const flags: FlagPos[] = [
    { code: 'kr', style: { top: '4%', left: '16%' } },
    { code: 'us', style: { top: '18%', right: '5%' } },
    { code: 'jp', style: { top: '60%', right: '0%' } },
    { code: 'vn', style: { bottom: '8%', right: '16%' } },
    { code: 'br', style: { bottom: '10%', left: '12%' } },
    { code: 'id', style: { top: '14%', left: '40%' } },
  ];

  return (
    <section className="mt-hero">
      {/* Decorative clouds */}
      <svg className="cloud cloud-1" viewBox="0 0 120 60" aria-hidden="true">
        <ellipse cx="30" cy="40" rx="22" ry="14" fill="white" />
        <ellipse cx="55" cy="32" rx="28" ry="18" fill="white" />
        <ellipse cx="85" cy="40" rx="22" ry="14" fill="white" />
      </svg>
      <svg className="cloud cloud-2" viewBox="0 0 120 60" aria-hidden="true">
        <ellipse cx="30" cy="40" rx="22" ry="14" fill="white" />
        <ellipse cx="55" cy="32" rx="28" ry="18" fill="white" />
        <ellipse cx="85" cy="40" rx="22" ry="14" fill="white" />
      </svg>
      <svg className="cloud cloud-3" viewBox="0 0 120 60" aria-hidden="true">
        <ellipse cx="30" cy="40" rx="22" ry="14" fill="white" />
        <ellipse cx="55" cy="32" rx="28" ry="18" fill="white" />
        <ellipse cx="85" cy="40" rx="22" ry="14" fill="white" />
      </svg>

      <div className="hero-left">
        <Reveal>
          <div className="label">
            <span className="pulse" />
            매주 갱신되는 글로벌 트렌드
          </div>
        </Reveal>
        <h1 className="hero-display">
          <span className="script">라온</span>과 함께하는
          <br />
          <span className="hl">세계 트렌드</span>
          <br />
          탐험!
        </h1>
        <Reveal delay={300}>
          <p className="subtitle">매주 국가별 다양한 트렌드를 알려드려요!</p>
        </Reveal>
        <Reveal delay={500}>
          <div className="meta-row">
            <span className="pill">
              <span className="num-mono">25</span>개국 매주
            </span>
            <span
              className="pill"
              style={{
                background: 'var(--ink-900)',
                color: 'white',
                borderColor: 'var(--ink-900)',
              }}
            >
              <span className="num-mono" style={{ color: 'var(--orange-300)' }}>
                {refreshSummary?.batchDate ?? 'LIVE'}
              </span>
              갱신 기준
            </span>
            {refreshSummary ? (
              <span className="pill">
                <span className="num-mono">{refreshSummary.countryCount}</span>개국 반영
              </span>
            ) : null}
          </div>
        </Reveal>
        {refreshSummary ? (
          <Reveal delay={560}>
            <p className="hero-refresh-note">
              마지막 검증 배치 {refreshSummary.batchDate} · {refreshSummary.trendCount}개 항목 반영
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={650}>
          <Link href="/raon" className="mt-raon-cta" aria-label="라온이 프로필 보러가기">
            <span className="raon-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/montra-assets/fox-happy.png?v=4" alt="" />
            </span>
            <span className="raon-cta-text">
              <span className="raon-cta-label">라온이 프로필 보러가기</span>
              <span className="raon-cta-sub">우리 마스코트 자세히 알아보기</span>
            </span>
            <span className="raon-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>
      </div>

      <div className="hero-right">
        <div className="stage">
          <div className="ring" />
          <div className="ring2" />
          <div className="blob" />
          <div className="fox-wave">
            <ChromaVideo src="/montra-assets/fox-wave.mp4" />
          </div>
          {flags.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f.code}
              className="flag floaty"
              src={`https://flagcdn.com/w160/${f.code}.png`}
              alt=""
              style={{
                ...f.style,
                animation: `floaty ${4 + i * 0.6}s ease-in-out ${i * 0.3}s infinite alternate`,
              }}
            />
          ))}
          <div className="hand" style={{ top: '-2%', right: '-4%' }}>
            안녕!
          </div>
          <svg
            className="hand-arrow"
            style={{ top: '4%', right: '8%', width: '60px', height: '40px' }}
            viewBox="0 0 60 40"
          >
            <path
              d="M5 5 Q 30 0, 50 28"
              stroke="#E15A28"
              strokeWidth="1.6"
              fill="none"
              strokeDasharray="3 3"
            />
            <path
              d="M50 28 L 44 22 M50 28 L 56 22"
              stroke="#E15A28"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            className="sticker speech-bubble"
            style={{ top: '26%', right: '12%', transform: 'rotate(2deg)' }}
          >
            안녕하세요,{' '}
            <span
              style={{
                color: 'var(--orange-500)',
                fontFamily: 'var(--font-hand)',
                fontSize: '1.15em',
              }}
            >
              라온
            </span>
            이에요!
          </div>
        </div>
      </div>
    </section>
  );
}
