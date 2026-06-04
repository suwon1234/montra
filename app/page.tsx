import CountryGrid from '@/components/montra/CountryGrid';
import Footer from '@/components/montra/Footer';
import Header from '@/components/montra/Header';
import Hero from '@/components/montra/Hero';
import Marquee from '@/components/montra/Marquee';
import ProcessStrip from '@/components/montra/ProcessStrip';
import ScrollFox from '@/components/montra/ScrollFox';
import Stats from '@/components/montra/Stats';
import { getLatestFocusMarketRefreshSummary } from '@/lib/data';

// CountryGrid가 DB 최신 배치를 반영하므로 짧은 ISR로 갱신
export const revalidate = 10;

function formatBatchDate(batchDate: string): string {
  const [year, month, day] = batchDate.split('-').map(Number);
  if (!year || !month || !day) return batchDate;
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

export default async function Page() {
  const refreshSummary = await getLatestFocusMarketRefreshSummary();

  return (
    <main className="mt-page">
      <Header />
      <Hero
        refreshSummary={
          refreshSummary
            ? {
                batchDate: formatBatchDate(refreshSummary.batch_date),
                countryCount: refreshSummary.country_count,
                trendCount: refreshSummary.trend_count,
              }
            : null
        }
      />
      <Stats />
      <CountryGrid />
      <ProcessStrip />
      <Marquee />
      <Footer />
      <ScrollFox />
    </main>
  );
}
