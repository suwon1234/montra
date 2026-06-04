/* CountryHero — 원본 country-page.jsx의 CountryHero 100% 이식
   서버 컴포넌트(인터랙션 없음, 단순 렌더). */
import type { MontraMarket } from '@/lib/focus-markets';

export interface RaonNote {
  msg: string;
  mood: 'happy' | 'surprised' | 'thinking' | 'winking' | 'excited' | 'confused';
}

const GREETINGS: Record<string, string> = {
  kr: '안녕하세요!',
  jp: '콘니치와!',
  us: '하이!',
  cn: '니하오!',
  gb: '헬로!',
  br: '올라~',
  mx: '올라~',
  id: '할로!',
  th: '사왓디카!',
  vn: '신짜오!',
  ph: '쿠무스타!',
  sg: '헬로!',
  tw: '니하오!',
  hk: '네이호우!',
  fr: '봉주르~',
  de: '할로!',
  it: '차오!',
  es: '올라~',
  ca: '하이!',
  au: '하이!',
  in: '나마스테!',
  my: '슬라맛!',
  ae: '살람!',
  sa: '살람!',
  tr: '메르하바!',
};

interface CountryHeroProps {
  market: MontraMarket;
  totalTrends: number;
  totalRising: number;
  avgScore: number;
  keywords: string[];
  note: RaonNote;
}

export default function CountryHero({
  market,
  totalTrends,
  totalRising,
  avgScore,
  keywords,
  note,
}: CountryHeroProps) {
  const moodImg = `/montra-assets/fox-${note.mood}.png`;
  return (
    <section className="c-hero">
      <div className="c-hero-left">
        <div className="c-eyebrow-hand">
          <span className="hand">이번 주 라온이가 다녀온 곳,</span>
          <svg
            className="squiggle"
            width="80"
            height="10"
            viewBox="0 0 80 10"
            fill="none"
            stroke="#161616"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 78 6" />
          </svg>
        </div>
        <div className="c-flagline">
          <img
            className="flag"
            src={`https://flagcdn.com/w320/${market.code.toLowerCase()}.png`}
            alt={market.name_ko}
          />
          <div className="flag-meta">
            <div className="code-row">
              <span className="code">{market.code.toUpperCase()}</span>
              <span className="en">{market.name_en}</span>
            </div>
            <div className="coords">37.55°N · 126.97°E · GMT+9</div>
          </div>
        </div>
        <h1 className="c-title">
          <span className="hl">{market.name_ko}</span>의<br />
          <span className="script">트렌드 탐험!</span>
        </h1>
        <p className="c-subtitle">
          매주 라온이가 직접 골라온 {market.name_ko} 트렌드 {totalTrends}개. 한국
          콘텐츠·푸드·뷰티가 어떻게 스며들고 있는지, 그 속도와 결을 봅니다.
        </p>

        <div className="c-keywords">
          <span className="kw-label">이 나라 핵심 키워드</span>
          <div className="kw-list">
            {keywords.map((k, i) => (
              <span key={`${k}-${i}`} className={`kw kw-${i % 4}`}>
                #{k}
              </span>
            ))}
          </div>
        </div>

        <div className="c-meta">
          <span className="pill">
            <span className="dot" />
            {market.signal}
          </span>
          <span className="pill mint">
            <span className="dot" />
            {market.lane}
          </span>
          <span className="pill dark">
            <span className="dot" />
            매주 화요일 갱신
          </span>
        </div>
      </div>

      <div className="c-hero-right">
        <div className="c-raon-card">
          <span className="speech">{GREETINGS[market.code.toLowerCase()] ?? '안녕하세요!'}</span>
          <div className="raon-line">
            <div className="fox">
              <img src={moodImg} alt="라온이" />
            </div>
            <div className="raon-msg">
              <strong>라온이가 본 {market.name_ko} 👇</strong>
              <br />
              {note.msg}
            </div>
          </div>
          <div className="signed-by">— 라온이 드림 🦊</div>
        </div>
        <div className="c-stats">
          <div className="stat">
            <div className="lbl">검증 트렌드</div>
            <div className="num">{totalTrends}</div>
          </div>
          <div className="stat rise">
            <div className="lbl">↗ 상승 중</div>
            <div className="num">{totalRising}</div>
          </div>
          <div className="stat hot">
            <div className="lbl">평균 스코어</div>
            <div className="num">{avgScore}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
