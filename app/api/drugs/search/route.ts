import { NextResponse, type NextRequest } from 'next/server';
import { searchMfds } from '@/lib/mfds';

// Vercel에서 이 함수를 서울 리전에서 실행 (식약처 API와 가까워 응답이 빠름)
export const preferredRegion = 'icn1';

/** GET /api/drugs/search?q=타이레놀 — 식약처 검색 프록시 (인증키는 서버에만 보관) */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ items: [], warnings: [] });
  try {
    return NextResponse.json(await searchMfds(q));
  } catch (e) {
    return NextResponse.json({ items: [], warnings: [], error: (e as Error).message }, { status: 502 });
  }
}
