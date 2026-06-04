import { getCountriesWithStats } from '@/lib/data';
import { MONTRA_FOCUS_MARKETS, type MontraMarket } from '@/lib/focus-markets';
import CountryCard from './CountryCard';
import Reveal from './Reveal';

export default async function CountryGrid() {
  // 1) DB(Docker PG → mock) 조회. 실패해도 lib/data.ts에서 mock fallback이 동작함.
  let stats: Awaited<ReturnType<typeof getCountriesWithStats>> = [];
  try {
    stats = await getCountriesWithStats();
  } catch (err) {
    console.error('[CountryGrid] getCountriesWithStats 예외, mock 풀로 폴백:', err);
    stats = [];
  }

  // 2) ISO alpha-2 대문자로 통일해 매핑
  const dbByCode = new Map(stats.map((s) => [s.code.toUpperCase(), s]));

  // 3) MONTRA_FOCUS_MARKETS(weekly + watch) 25개 풀에 DB 값을 덮어씀
  const allFromMock: MontraMarket[] = [
    ...MONTRA_FOCUS_MARKETS.weekly,
    ...MONTRA_FOCUS_MARKETS.watch,
  ];
  const allMarkets: MontraMarket[] = allFromMock.map((m) => {
    const db = dbByCode.get(m.code.toUpperCase());
    return {
      ...m,
      verified: db?.total_trends ?? m.verified,
      investigated: db?.investigated_count ?? m.investigated ?? 0,
      rising: db?.rising_count ?? m.rising,
      headline: db?.top_trend ?? m.headline,
    };
  });

  // 4) 핫한 국가 — rising desc, 동률이면 verified desc 기준 상위 6곳
  const hotMarkets: MontraMarket[] = [...allMarkets]
    .sort((a, b) => b.rising - a.rising || b.verified - a.verified)
    .slice(0, 6);

  return (
    <section className="mt-grid-section">
      <Reveal>
        <div className="mt-grid-header">
          <div>
            <div className="mt-eyebrow">라온과 함께 국가별 트렌드를 알아봐요</div>
            <h2 className="mt-section-title">
              어디 먼저
              <br />
              탐험해 볼래?
            </h2>
            <p className="mt-section-sub" style={{ marginTop: 16 }}>
              매주 국가별 트렌드를 쉽고 빠르게 알아보실 수 있습니다.
            </p>
          </div>
          <div className="count">
            <strong>{allMarkets.length}</strong>곳
          </div>
        </div>
      </Reveal>
      <div className="mt-country-grid">
        {allMarkets.map((m, i) => (
          <CountryCard key={m.code} market={m} index={i} />
        ))}
      </div>

      <div className="mt-watch-wrap">
        <Reveal>
          <div className="mt-grid-header">
            <div>
              <div className="mt-eyebrow">라온이 선택한 가장 핫한 국가에요</div>
              <h2
                className="mt-section-title"
                style={{ fontSize: 'clamp(28px, 3.6vw, 48px)' }}
              >
                여기부터
                <br />
                탐험해 볼까?
              </h2>
              <p
                className="mt-section-sub"
                style={{ marginTop: 14, fontSize: 15 }}
              >
                가장 많은 트렌드가 바뀐 국가입니다.
              </p>
            </div>
            <div className="count">
              <strong>{hotMarkets.length}</strong>곳
            </div>
          </div>
        </Reveal>
        <div className="mt-country-grid">
          {hotMarkets.map((m, i) => (
            <CountryCard key={m.code} market={m} watch index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
