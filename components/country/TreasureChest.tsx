'use client';

import { useEffect, useRef, useState } from 'react';
import ChestSVG from './ChestSVG';

interface TreasureChestProps {
  marketCode: string;
  marketLabel: string;
  onOpen?: () => void;
}

/* 보물상자 — CSS 키프레임 기반 (원본 treasure-chest.jsx 직접 이식) */
export default function TreasureChest({ marketCode, marketLabel, onOpen }: TreasureChestProps) {
  const chestRef = useRef<HTMLDivElement | null>(null);
  const [opened, setOpened] = useState(false);
  const [armed, setArmed] = useState(false);

  // Auto-arm when scrolled into view (visual cue only)
  useEffect(() => {
    if (!chestRef.current) return;
    const el = chestRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) setArmed(true);
        });
      },
      { threshold: [0.5, 0.8] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const openChest = () => {
    if (opened) return;
    setOpened(true);
    // Reveal trends when lid is mostly up (~1.4s into the 3s anim)
    window.setTimeout(() => {
      if (onOpen) onOpen();
    }, 1400);

    // Fallback for environments where CSS animations stall (some iframes)
    window.setTimeout(() => {
      const top = chestRef.current?.querySelector<HTMLElement>('#cc-chest-top');
      const lock = chestRef.current?.querySelector<HTMLElement>('#cc-chest-lock');
      const sparkles = chestRef.current?.querySelector<HTMLElement>('#cc-chest-sparkles');
      if (top && getComputedStyle(top).transform === 'matrix(1, 0, 0, 1, 0, 0)') {
        top.style.cssText =
          'transform: translateY(-20%) !important; opacity: 0 !important; animation: none !important;';
        if (lock) {
          lock.style.cssText =
            'transform: scale(2) !important; opacity: 0 !important; animation: none !important;';
        }
        if (sparkles) {
          sparkles.style.cssText = 'opacity: 0 !important;';
        }
      }
    }, 3200);
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openChest();
    }
  };

  // marketCode는 소문자로 들어옴 (focus-markets) — flagcdn은 소문자 사용
  const flagSrc = `https://flagcdn.com/w80/${marketCode.toLowerCase()}.png`;

  return (
    <div className="chest-stage">
      {/* Floating prompt above chest */}
      {!opened && (
        <div className="chest-prompt">
          <span className="hand">탭해서 보물상자 열기</span>
          <svg width="40" height="34" viewBox="0 0 40 34" fill="none">
            <path
              d="M20 2 Q 8 14, 16 28"
              stroke="#161616"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M16 28 L 11 24 M 16 28 L 20 22"
              stroke="#161616"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      <div className="chest-glow" aria-hidden="true" />

      {/* Country flag tag dangling on the chest */}
      <div className="chest-tag">
        <div className="tag-string" />
        <div className="tag-card">
          <img
            src={flagSrc}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <span>{marketLabel}</span>
        </div>
      </div>

      {/* Chest (clickable) */}
      <div
        ref={chestRef}
        className={`chest ${armed ? 'armed' : ''} ${opened ? 'open-chest' : 'shake-chest'}`}
        onClick={openChest}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-label="보물상자 열기"
      >
        <ChestSVG />
      </div>

      <div className="chest-shadow" />
    </div>
  );
}
