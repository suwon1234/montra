'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-[#fafaf9]">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
        {/* 좌측: 로고 (홈 링크) */}
        <Link href="/" className="flex items-center">
          <span className="text-base font-extrabold tracking-tight text-[#0a0a0a]">MONTRA</span>
        </Link>

        {/* 중앙: 메뉴 */}
        <div className="hidden sm:flex gap-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <Link href="/explore" className="hover:text-[#0a0a0a] transition-colors">
            탐색
          </Link>
          <Link href="/ranking" className="hover:text-[#0a0a0a] transition-colors">
            랭킹
          </Link>
        </div>

        {/* 우측: 균형 맞추기용 빈 공간 */}
        <div className="w-8" />
      </div>
    </nav>
  );
}
