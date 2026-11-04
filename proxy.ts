import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseEnv } from '@/lib/supabase/env';

/** 관리자 세션을 갱신하고, 로그인하지 않았으면 로그인 화면으로 보냄 (권한 확인은 각 화면과 서버 액션에서 다시 함) */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, value));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};
