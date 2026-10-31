import { NextResponse, type NextRequest } from 'next/server';
import { getDetail } from '@/lib/mfds';

// 식약처 상세 API가 20초 이상 걸릴 수 있어 함수 실행 시간을 늘림 (Vercel)
export const maxDuration = 60;

/** GET /api/drugs/detail?itemSeq=201907575 — 용법용량 원문 + 자동 입력 후보 */
export async function GET(req: NextRequest) {
  const itemSeq = req.nextUrl.searchParams.get('itemSeq')?.trim() ?? '';
  if (!/^\d{6,12}$/.test(itemSeq)) {
    return NextResponse.json({ error: 'itemSeq가 올바르지 않습니다.' }, { status: 400 });
  }
  try {
    const category = req.nextUrl.searchParams.get('cat')?.slice(0, 60) ?? '';
    return NextResponse.json(await getDetail(itemSeq, category));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
