/* TrendCard — 원본 country-page.jsx의 TrendCard 100% 이식
   서버 컴포넌트 OK (인터랙션은 부모 useEffect에서 CSS 변수만 주입). */

export type CountryCategorySlug =
  | 'fashion'
  | 'products'
  | 'food'
  | 'brands'
  | 'challenge';

export type CountryHeatStatus = 'rising' | 'steady' | 'cooling' | 'new';

export interface CountryTrendCard {
  rank: number;
  title: string;
  desc: string;
  tags: string[];
  categorySlug: CountryCategorySlug;
  heatStatus: CountryHeatStatus;
  score: number;
  growth: string;
  verified: number;
  raon?: string | null;
}

interface TrendCardProps {
  trend: CountryTrendCard;
  isFeatured?: boolean;
}

export default function TrendCard({ trend, isFeatured }: TrendCardProps) {
  return (
    <article className={`c-trend-card ${isFeatured ? 'featured' : ''}`}>
      <div className="rank">{String(trend.rank).padStart(2, '0')}</div>
      <div className="tags">
        {trend.tags.map((t, i) => {
          const isRising = t === '상승' || t.toLowerCase() === 'rising';
          const isChallenge = t === '챌린지' || t.toLowerCase() === 'challenge';
          const cls = isRising ? 'rise' : isChallenge ? 'hot' : '';
          return (
            <span key={`${t}-${i}`} className={`tag ${cls}`}>
              {isRising && '↗ '}
              {t}
            </span>
          );
        })}
        <span className="tag kr">KR</span>
      </div>
      <h3>{trend.title}</h3>
      <p className="desc">{trend.desc}</p>
      <div className="stats">
        <div className="s">
          <div className="v">{trend.score}</div>
          <div className="l">스코어</div>
        </div>
        <div className="s">
          <div className="v up">{trend.growth}</div>
          <div className="l">지난주 대비</div>
        </div>
        <div className="s">
          <div className="v">{trend.verified}</div>
          <div className="l">확인 횟수</div>
        </div>
      </div>
      {trend.raon && (
        <div className="raon-tip">
          <div className="mini-fox">
            <img src="/montra-assets/fox-excited.png" alt="" />
          </div>
          <div className="text">
            <strong>라온이의 한마디</strong>
            {trend.raon}
          </div>
        </div>
      )}
    </article>
  );
}
