'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof document !== 'undefined' && document.hidden) {
      el.classList.add('in');
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      const t = setTimeout(() => el.classList.add('in'), delay);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add('in'), delay);
            io.disconnect();
          }
        });
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    const tm = setTimeout(() => el.classList.add('in'), 1500 + delay);
    return () => {
      io.disconnect();
      clearTimeout(tm);
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
