import { NextRequest, NextResponse } from 'next/server';
import { getGlobalRanking } from '@/lib/data';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // --- Parse limit parameter ---
  const limitRaw = searchParams.get('limit');
  let limit = DEFAULT_LIMIT;
  if (limitRaw !== null) {
    const parsed = parseInt(limitRaw, 10);
    if (isNaN(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: 'limit must be a positive integer' },
        { status: 400 }
      );
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  // --- Get all trends, sort by heat_score descending, assign rank ---
  const allTrends = await getGlobalRanking(limit);

  const ranked = allTrends.map((t, index) => ({
    rank: index + 1,
    country_code: t.country.code,
    country_flag: t.country.flag_emoji,
    name: t.name,
    heat_score: t.heat_score,
    heat_status: t.heat_status,
    category_slug: t.category.slug,
    category_emoji: t.category.emoji,
  }));

  return NextResponse.json({ data: ranked });
}
