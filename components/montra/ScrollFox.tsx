'use client';

import { useEffect, useRef, useState } from 'react';

interface FoxSection {
  sel: string;
  pose: string;
  msg: string;
}

const SECTIONS: FoxSection[] = [
  { sel: '.mt-hero', pose: 'happy', msg: '' },
  { sel: '.mt-stats', pose: 'surprised', msg: '이만큼이나!' },
  { sel: '.mt-grid-section', pose: 'thinking', msg: '국가별 트렌드에요' },
  { sel: '.mt-watch-wrap', pose: 'winking', msg: '이번주 가장 핫한 국가에요' },
  { sel: '.mt-process', pose: 'excited', msg: '알고리즘이 일해요' },
  { sel: '.mt-marquee', pose: 'happy', msg: '지난 주 신호' },
  { sel: '.mt-footer', pose: 'winking', msg: '다음 주에 봐요!' },
];

export default function ScrollFox() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pose, setPose] = useState('happy');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const my = window.scrollY + window.innerHeight * 0.6;
      let active = SECTIONS[0];
      for (const s of SECTIONS) {
        const node = document.querySelector(s.sel) as HTMLElement | null;
        if (!node) continue;
        const top = node.offsetTop;
        if (my >= top) active = s;
      }
      setPose(active.pose);
      setMsg(active.msg);
      if (window.scrollY < 400) el.classList.remove('visible');
      else el.classList.add('visible');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="mt-fox-scroll">
      {msg ? (
        <>
          <div className="bubble">{msg}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/montra-assets/fox-${pose}.png?v=4`} alt="" />
        </>
      ) : null}
    </div>
  );
}
