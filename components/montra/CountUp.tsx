'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

export default function CountUp({ end, duration = 1600, suffix = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(end);

  useEffect(() => {
    let started = false;
    const startAnim = () => {
      if (started) return;
      started = true;
      setVal(0);
      const startT = performance.now();
      const animate = (t: number) => {
        const p = Math.min(1, (t - startT) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };
    if (typeof document !== 'undefined' && document.hidden) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) startAnim();
        });
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="num">
      {val}
      {suffix}
    </span>
  );
}
