import { NextResponse, type NextRequest } from 'next/server';
import { QuotaError, backTranslate, translateKo, type TranslateKind } from '@/lib/translate';

const KINDS: TranslateKind[] = ['route', 'unit', 'freq', 'timing', 'cycle', 'days', 'note', 'name', 'pharmacy'];

/** POST /api/translate { kind, ko } → { en, back } — 한국어 직접 입력을 영어로 (키는 서버에만) */
export async function POST(req: NextRequest) {
  let body: { kind?: string; ko?: string; en?: string; noBack?: boolean; backOnly?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }
  const kind = body.kind as TranslateKind;
  const ko = (body.ko ?? '').trim();
  if (!KINDS.includes(kind)) return NextResponse.json({ error: '알 수 없는 항목입니다.' }, { status: 400 });
  // 역번역만 요청: 영어가 먼저 화면에 뜬 뒤 확인용 한국어를 따로 받음
  if (body.backOnly) {
    const en = (body.en ?? '').trim();
    if (!en || en.length > 600) return NextResponse.json({ back: '' });
    try {
      return NextResponse.json({ back: await backTranslate(kind, en) });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: e instanceof QuotaError ? 429 : 502 });
    }
  }
  if (!ko) return NextResponse.json({ en: '', back: '' });
  if (ko.length > 300) return NextResponse.json({ error: '300자 이하로 입력하세요.' }, { status: 400 });
  // 깨진 글자(인코딩 오류)나 의미 있는 글자가 없는 입력은 번역하지 않음 — 모델이 엉뚱한 문장을 지어내는 것 방지
  if (/�/.test(ko) || !/[가-힣A-Za-z0-9]/.test(ko)) {
    return NextResponse.json({ error: '글자가 깨졌거나 읽을 수 없는 입력입니다. 다시 입력해 주세요.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await translateKo(kind, ko, !body.noBack));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof QuotaError ? 429 : 502 });
  }
}
