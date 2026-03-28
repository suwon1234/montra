import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabase 브라우저 클라이언트를 생성/반환합니다.
 * 환경변수가 없으면 null을 반환하여 Mock 데이터 fallback이 가능하도록 합니다.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === 'https://your-project.supabase.co') {
    console.warn(
      '[Supabase] 환경변수가 설정되지 않았습니다. Mock 데이터를 사용합니다.'
    );
    return null;
  }

  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

/**
 * Supabase 연결 여부를 확인합니다.
 */
export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}
