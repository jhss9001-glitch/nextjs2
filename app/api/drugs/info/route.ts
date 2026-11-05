import { NextResponse, type NextRequest } from 'next/server';
import { buildPatientInfo } from '@/lib/patient-info';
import { QuotaError } from '@/lib/translate';

// 식약처 상세(느릴 수 있음) + Gemini 요약·번역 2회 + 역번역 1회 (Cloud Translation 실패 시 Gemini)
export const maxDuration = 60;

/**
 * POST /api/drugs/info { itemSeq, efcy?, se? }
 *  → 환자 설명 초안 { purpose, sideEffects[], serious } (각 { ko, en, back })
 *  efcy/se: 일반의약품의 e약은요 효능·부작용 문장 (보충 자료)
 */
export async function POST(req: NextRequest) {
  let body: { itemSeq?: string; efcy?: string; se?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }
  const itemSeq = String(body.itemSeq ?? '').trim();
  if (!/^\d{6,12}$/.test(itemSeq)) return NextResponse.json({ error: 'itemSeq가 올바르지 않습니다.' }, { status: 400 });
  try {
    return NextResponse.json(
      await buildPatientInfo(itemSeq, { efcy: body.efcy?.slice(0, 2000), se: body.se?.slice(0, 3000) })
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof QuotaError ? 429 : 502 });
  }
}
