// Supabase는 더 이상 사용하지 않습니다.
// 데이터 레이어는 Docker PostgreSQL(lib/db.ts) -> mock-data fallback 2단계로 동작합니다.
// 기존 lib/data.ts의 Supabase 블록은 항상 null을 받아 도달하지 않습니다.

export function getSupabaseClient(): null {
  return null;
}

export function isSupabaseConnected(): boolean {
  return false;
}
