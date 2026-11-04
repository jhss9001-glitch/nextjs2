/* Supabase Auth 클라이언트 (서버 전용). 관리자 로그인에만 쓰고, 데이터 조회는 lib/db.ts로 한다 */
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from '@/lib/supabase/env';

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없음. 세션 갱신은 proxy.ts가 맡음
        }
      }
    }
  });
}
