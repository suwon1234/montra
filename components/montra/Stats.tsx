import { getCountriesWithStats } from '@/lib/data';
import { MONTRA_FOCUS_MARKETS } from '@/lib/focus-markets';
import CountUp from './CountUp';

const HOT_COUNTRY_COUNT = 6;
const TOTAL_TRENDS_FALLBACK = 472;
const TOTAL_INVESTIGATED_FALLBACK = 612;

export default async function Stats() {
  const totalCountries =
    MONTRA_FOCUS_MARKETS.weekly.length + MONTRA_FOCUS_MARKETS.watch.length;

  let totalTrends = TOTAL_TRENDS_FALLBACK;
  let totalInvestigated = TOTAL_INVESTIGATED_FALLBACK;

  try {
    const stats = await getCountriesWithStats();
    const totalTrendSum = stats.reduce((acc, country) => acc + (country.total_trends ?? 0), 0);
    const investigatedSum = stats.reduce((acc, country) => acc + (country.investigated_count ?? 0), 0);

    if (totalTrendSum > 0) totalTrends = totalTrendSum;
    if (investigatedSum > 0) totalInvestigated = investigatedSum;
  } catch (err) {
    console.error('[Stats] getCountriesWithStats failed, using fallback:', err);
  }

  return (
    <section className="mt-stats">
      <div className="grid">
        <div className="stat">
          <div className="corner" />
          <div className="label">매주 보는 나라</div>
          <div className="value">
            <CountUp end={totalCountries} />
            <span className="unit">국</span>
          </div>
          <div className="desc">
            한국과 연결이 빠른 핵심 시장을 매주 같은 기준으로 다시 봅니다.
          </div>
        </div>

        <div className="stat">
          <div className="label">지금 가장 뜨거운 나라</div>
          <div className="value">
            <CountUp end={HOT_COUNTRY_COUNT} />
            <span className="unit">국</span>
          </div>
          <div className="desc">
            이번 주에 특히 반응이 빠른 시장만 따로 모아 바로 확인할 수 있게 했습니다.
          </div>
        </div>

        <div className="stat">
          <div className="label">이번 주 조사 항목</div>
          <div className="value">
            <CountUp end={totalInvestigated} duration={2200} />
            <span className="unit">건</span>
          </div>
          <div className="desc">25개국에서 넓게 조사한 후보 수. 이중 검증 통과는 {totalTrends}건입니다.</div>
        </div>
      </div>
    </section>
  );
}
