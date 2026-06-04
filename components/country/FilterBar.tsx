'use client';

const FILTERS = ['전체', '상승', '옷', '상품', '음식', '브랜드', '챌린지'];

interface FilterBarProps {
  active: string;
  setActive: (f: string) => void;
  count: number;
}

export default function FilterBar({ active, setActive, count }: FilterBarProps) {
  return (
    <div className="c-filterbar">
      <div className="c-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`c-filter-btn ${active === f ? 'active' : ''}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="c-sort">{count} TRENDS · SORTED BY SCORE</div>
    </div>
  );
}

export { FILTERS };
