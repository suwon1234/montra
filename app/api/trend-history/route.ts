import { NextRequest, NextResponse } from 'next/server';
import { getBatchHistoryForTrends } from '@/lib/data';

const MAX_TREND_IDS = 50;

// UUID v4 형식 검증 (하이픈 포함)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // --- trend_ids 파라미터 파싱 ---
  const trendIdsRaw = searchParams.get('trend_ids');

  if (!trendIdsRaw || trendIdsRaw.trim() === '') {
    return NextResponse.json(
      { error: 'trend_ids parameter is required' },
      { status: 400 }
    );
  }

  const trendIds = trendIdsRaw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (trendIds.length === 0) {
    return NextResponse.json(
      { error: 'trend_ids must contain at least one valid ID' },
      { status: 400 }
    );
  }

  if (trendIds.length > MAX_TREND_IDS) {
    return NextResponse.json(
      {
        error: `Too many trend_ids. Maximum is ${MAX_TREND_IDS}, got ${trendIds.length}`,
      },
      { status: 400 }
    );
  }

  // UUID 형식 검증 (mock ID도 허용)
  const invalidIds = trendIds.filter(
    (id) => !UUID_REGEX.test(id) && !id.startsWith('trend-')
  );
  if (invalidIds.length > 0) {
    return NextResponse.json(
      {
        error: `Invalid trend_id format: ${invalidIds.join(', ')}`,
      },
      { status: 400 }
    );
  }

  // --- 배치 히스토리 조회 ---
  const historyMap = await getBatchHistoryForTrends(trendIds);

  // 응답 형식: date + search_score + social_score 로 변환
  const data: Record<
    string,
    { date: string; search_score: number; social_score: number }[]
  > = {};

  for (const [trendId, histories] of Object.entries(historyMap)) {
    data[trendId] = histories.map((h) => ({
      date: h.recorded_at.split('T')[0], // YYYY-MM-DD 형식
      search_score: h.search_score ?? 0,
      social_score: h.social_score ?? 0,
    }));
  }

  return NextResponse.json({ data });
}
