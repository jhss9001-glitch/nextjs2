export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. (로컬: .env.local / Vercel: Settings → Environment Variables 추가 후 재배포)');
  }
  return { url, key };
}
