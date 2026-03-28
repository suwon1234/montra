'use client';

import { motion } from 'motion/react';
import type { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {/* "전체" 버튼 */}
      <motion.button
        onClick={() => onSelect(null)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
          selected === null
            ? 'bg-[#0a0a0a] text-white'
            : 'bg-white text-stone-500 border border-[#e5e5e5] hover:border-stone-300 hover:text-[#0a0a0a]'
        }`}
      >
        전체
      </motion.button>

      {/* 카테고리 버튼 */}
      {categories.map((cat) => (
        <motion.button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            selected === cat.slug
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-white text-stone-500 border border-[#e5e5e5] hover:border-stone-300 hover:text-[#0a0a0a]'
          }`}
        >
          <span className="text-base">{cat.emoji}</span>
          {cat.name_ko}
        </motion.button>
      ))}
    </div>
  );
}
