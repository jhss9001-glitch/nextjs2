import { NextResponse, type NextRequest } from 'next/server';
import { getPill } from '@/lib/mfds';

export const maxDuration = 60;
export const preferredRegion = 'icn1'; // 식약처 API와 가까운 서울 리전

/** GET /api/drugs/pill?itemSeq=202200407 — 낱알식별 사진·모양 ({ pill: null }이면 낱알 정보 없는 품목) */
export async function GET(req: NextRequest) {
  const itemSeq = req.nextUrl.searchParams.get('itemSeq')?.trim() ?? '';
  if (!/^\d{6,12}$/.test(itemSeq)) {
    return NextResponse.json({ error: 'itemSeq가 올바르지 않습니다.' }, { status: 400 });
  }
  try {
    return NextResponse.json({ pill: await getPill(itemSeq) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
