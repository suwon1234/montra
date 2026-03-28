import { NextResponse } from 'next/server';
import { getCountriesWithStats } from '@/lib/data';

export async function GET() {
  const countries = await getCountriesWithStats();

  // Only return active countries
  const activeCountries = countries.filter((c) => c.is_active);

  return NextResponse.json({
    data: activeCountries.map((c) => ({
      code: c.code,
      name_ko: c.name_ko,
      name_en: c.name_en,
      flag_emoji: c.flag_emoji,
      region: c.region,
      rising_count: c.rising_count,
      total_trends: c.total_trends,
      top_trend: c.top_trend,
    })),
  });
}
