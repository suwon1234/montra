'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface RFadeProps {
  delay?: number;
  children: ReactNode;
}

export default function RFade({ delay = 0, children }: RFadeProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      setTimeout(() => {
        el.classList.add('in');
      }, delay);
    };

    if (typeof IntersectionObserver === 'undefined') {
      fire();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fire();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);

    // safety: fire after 1.2s regardless
    safetyTimer = setTimeout(fire, 1200);

    return () => {
      io.disconnect();
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [delay]);

  return (
    <div ref={ref} className="r-fade">
      {children}
    </div>
  );
}
