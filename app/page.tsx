'use client';

import React from 'react';
import Link from 'next/link';
import WorldMap from '@/components/WorldMap';
import { motion } from 'motion/react';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#0a0a0a] font-sans overflow-x-hidden">

      {/* Navigation — clean, minimal */}
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center"
        >
          <span className="text-lg font-extrabold tracking-tight uppercase text-[#0a0a0a]">MONTRA</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="hidden md:flex gap-1 bg-white rounded-full px-2 py-1.5 border border-[#e5e5e5]"
        >
          {[
            { label: '탐색', href: '/explore' },
            { label: '랭킹', href: '/ranking' },
            { label: '카테고리', href: '/category/fashion' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400 hover:text-[#0a0a0a] hover:bg-stone-100 transition-all duration-200 px-4 py-1.5 rounded-full"
            >
              {item.label}
            </Link>
          ))}
        </motion.div>

        <div className="w-8" />
      </nav>

      {/* Hero Section — 지도 풀스크린 중앙 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* 지도 컨테이너 — 화면의 80~90% 차지 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'circOut' }}
          className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center z-20"
        >
          <WorldMap />
        </motion.div>
      </section>

      {/* 미니멀 Footer */}
      <footer className="fixed bottom-0 w-full px-8 py-3 flex justify-between items-center text-[9px] uppercase tracking-widest font-mono text-stone-400 pointer-events-none border-t border-[#e5e5e5] bg-[#fafaf9]">
        <span>&copy; 2026 MONTRA</span>
        <div className="flex gap-4 pointer-events-auto">
          {['TW', 'IG', 'LI'].map(s => (
            <a key={s} href="#" className="hover:text-[#0a0a0a] transition-colors">{s}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
