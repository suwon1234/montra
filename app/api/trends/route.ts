import { NextRequest, NextResponse } from 'next/server';
import { getTrends } from '@/lib/data';
import type { CategorySlug, HeatStatus } from '@/lib/types';

const VALID_STATUSES: HeatStatus[] = ['rising', 'steady', 'cooling', 'new'];
const VALID_CATEGORIES: CategorySlug[] = [
  'fashion',
  'products',
  'food',
  'brands',
  'challenge',
];
const VALID_SORTS = ['heat_score', 'newest', 'fastest_rising'] as const;
type SortOption = (typeof VALID_SORTS)[number];

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // --- Parse query parameters ---
  const country = searchParams.get('country')?.toUpperCase() ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const sort = (searchParams.get('sort') ?? 'heat_score') as SortOption;

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

  // --- Validate parameters ---
  if (status && !VALID_STATUSES.includes(status as HeatStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (category && !VALID_CATEGORIES.includes(category as CategorySlug)) {
    return NextResponse.json(
      {
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (!VALID_SORTS.includes(sort)) {
    return NextResponse.json(
      {
        error: `Invalid sort. Must be one of: ${VALID_SORTS.join(', ')}`,
      },
      { status: 400 }
    );
  }

  // --- Map sort option to data layer parameters ---
  let sortBy: 'heat_score' | 'first_detected_at' | 'last_updated_at' =
    'heat_score';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sort === 'newest') {
    sortBy = 'first_detected_at';
    sortOrder = 'desc';
  }
  // fastest_rising: handled with custom sort below

  // --- Fetch and filter data ---
  if (sort === 'fastest_rising') {
    // Custom sort: rising status first, then by heat_score descending
    const allFiltered = await getTrends({
      countryCode: country,
      categorySlug: category as CategorySlug | undefined,
      heatStatus: status as HeatStatus | undefined,
      sortBy: 'heat_score',
      sortOrder: 'desc',
    });

    allFiltered.sort((a, b) => {
      const aIsRising = a.heat_status === 'rising' ? 1 : 0;
      const bIsRising = b.heat_status === 'rising' ? 1 : 0;
      if (bIsRising !== aIsRising) return bIsRising - aIsRising;
      return b.heat_score - a.heat_score;
    });

    const data = allFiltered.slice(0, limit);

    return NextResponse.json({
      data: data.map((t) => ({
        id: t.id,
        country: t.country,
        category: t.category,
        name: t.name,
        description: t.description,
        heat_score: t.heat_score,
        heat_status: t.heat_status,
        search_score: t.search_score,
        social_score: t.social_score,
        ecommerce_score: t.ecommerce_score,
        news_score: t.news_score,
        tags: t.tags,
        last_updated_at: t.last_updated_at,
      })),
      meta: { total: data.length, limit },
    });
  }

  const data = await getTrends({
    countryCode: country,
    categorySlug: category as CategorySlug | undefined,
    heatStatus: status as HeatStatus | undefined,
    sortBy,
    sortOrder,
    limit,
  });

  return NextResponse.json({
    data: data.map((t) => ({
      id: t.id,
      country: t.country,
      category: t.category,
      name: t.name,
      description: t.description,
      heat_score: t.heat_score,
      heat_status: t.heat_status,
      search_score: t.search_score,
      social_score: t.social_score,
      ecommerce_score: t.ecommerce_score,
      news_score: t.news_score,
      tags: t.tags,
      last_updated_at: t.last_updated_at,
    })),
    meta: { total: data.length, limit },
  });
}
