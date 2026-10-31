/* =========================================================
 * 식약처 공공데이터 API (서버 전용 — 클라이언트 컴포넌트에서 import 금지)
 *  - e약은요(의약품개요정보): 효능·사용법·주의사항 등 (일반의약품 위주)
 *  - 의약품 제품 허가정보: 전문의약품 포함 전체 품목, 분류·주성분
 * ========================================================= */
import { docXmlToText, parseDosage } from '@/lib/dosage-parse';
import type { DosageCandidate, Drug, MfdsInfo, Route, UnitKey } from '@/lib/types';

const BASE = 'https://apis.data.go.kr/1471000';
const EASY_URL = `${BASE}/DrbEasyDrugInfoService/getDrbEasyDrugList`;
const PERMIT_URL = `${BASE}/DrugPrdtPrmsnInfoService08/getDrugPrdtPrmsnInq08`;
// 상세: 첨부문서 전체(수백 KB)가 함께 와서 20초 이상 걸릴 수 있음 → 결과를 캐시
const DETAIL_URL = `${BASE}/DrugPrdtPrmsnInfoService08/getDrugPrdtPrmsnDtlInq08`;

type Row = Record<string, unknown>;

function serviceKey(): string {
  const raw = process.env.MFDS_API_KEY?.trim();
  if (!raw) {
    throw new Error(
      'MFDS_API_KEY가 설정되지 않았습니다. (로컬: .env.local / Vercel: Settings → Environment Variables 추가 후 재배포)'
    );
  }
  // 포털의 Encoding 키를 넣었어도 동작하도록 한 번 디코딩 (URLSearchParams가 다시 인코딩함)
  return raw.includes('%') ? decodeURIComponent(raw) : raw;
}

/** HTML 태그·연속 공백 제거 */
export function clean(v: unknown): string {
  return String(v ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

const pick = (r: Row, ...keys: string[]) => {
  for (const k of keys) if (r[k] != null && r[k] !== '') return clean(r[k]);
  return '';
};

async function callApi(url: string, params: Record<string, string>, timeoutMs = 8000): Promise<Row[]> {
  const qs = new URLSearchParams({ serviceKey: serviceKey(), type: 'json', pageNo: '1', ...params });
  const res = await fetch(`${url}?${qs}`, { signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  let json: { header?: Row; body?: { items?: unknown }; response?: { header?: Row; body?: { items?: unknown } } };
  try {
    json = JSON.parse(text);
  } catch {
    // 인증 오류 등은 JSON 요청에도 XML로 오는 경우가 있음
    throw new Error(text.match(/<returnAuthMsg>([^<]+)/)?.[1] || text.slice(0, 200));
  }
  const root = json.response ?? json;
  const code = root.header?.resultCode;
  if (code && code !== '00') throw new Error(`${code} ${String(root.header?.resultMsg ?? '')}`);
  const items = root.body?.items;
  if (!items) return [];
  if (Array.isArray(items)) return items as Row[];
  const inner = (items as { item?: Row | Row[] }).item;
  return inner ? (Array.isArray(inner) ? inner : [inner]) : [];
}

/** 품목명·분류로 사용 경로 추정 (모르면 내복) */
export function guessRoute(name: string, category = ''): Route {
  const s = `${name} ${category}`;
  if (/점안|안약|안연고|안과/.test(s)) return 'eye';
  if (/연고|크림|겔|젤|로션|외용|패취|패치|플라스타|카타플라스마|스프레이|외피|파스|첩부/.test(s)) return 'topical';
  return 'oral';
}

/** 주사제: "…주사", "…주(성분)", "…주", "…주프리필드" 등 */
export function isInjection(name: string): boolean {
  const base = name.split(',')[0].replace(/\([^()]*\)/g, '').trim();
  return /주사|주$|주\d|주프리필드|프리필드|키트주/.test(base);
}

export function guessUnit(name: string, route: Route): UnitKey {
  if (route === 'eye') return 'drop';
  if (/캡슐|연질/.test(name)) return 'cap';
  // 한글에는 \b가 동작하지 않으므로 제형 단어로만 판별 ('산'은 '히알루론산' 등과 겹쳐 제외)
  if (/시럽|현탁|액|드링크/.test(name)) return 'ml';
  if (/과립|산제|가루|산\d/.test(name)) return 'pkt'; // 산\d: "어린이타이레놀산160밀리그램"
  return 'tab';
}

function toDrug(info: MfdsInfo, itemName: string, engName: string, category: string): Drug {
  const route = guessRoute(itemName, category);
  // 품목명 괄호 안의 한글 성분명: "어린이타이레놀산160밀리그램(아세트아미노펜)" → 아세트아미노펜
  // 여러 괄호 중 수출명·1회용 같은 표기는 건너뛰고 첫 번째 한글 성분명을 사용
  const koIngr =
    [...itemName.split(',')[0].matchAll(/\(([^()]*[가-힣][^()]*)\)/g)]
      .map((m) => m[1].trim())
      .find((s) => !/수출명|회용|무보존|분할|포장/.test(s)) ?? '';
  return {
    id: `mfds:${info.itemSeq}`,
    brand: itemName,
    brandEn: '',
    cat: category.replace(/^\[\d+\]\s*/, '') || info.etcOtc || '식약처',
    route,
    ing: { ko: koIngr || itemName, en: engName },
    use: { ko: info.efcy || '', en: '' },
    warn: [],
    def: { unit: guessUnit(itemName, route), qty: 1, freq: '3', timing: 'after_30' },
    mfds: info
  };
}

const cache = new Map<string, { at: number; data: SearchResult }>();
const TTL = 1000 * 60 * 60;

export interface DetailResult {
  itemSeq: string;
  itemName: string;
  ud: string; // 용법용량 원문
  ee: string; // 효능효과 원문
  se: string; // 사용상 주의사항 중 "이상반응" 항목 원문 (부작용 설명용)
  candidates: DosageCandidate[];
}

/** 주의사항 문서(NB_DOC_DATA)에서 "이상반응/부작용" 항목만 텍스트로 (너무 길면 앞부분만) */
function sideEffectSection(nbXml: string, limit = 8000): string {
  const parts: string[] = [];
  for (const m of nbXml.matchAll(/<ARTICLE[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/ARTICLE>/g)) {
    if (/이상\s*반응|부작용/.test(m[1])) parts.push(docXmlToText(m[0]));
  }
  return parts.join('\n').slice(0, limit);
}

const detailCache = new Map<string, DetailResult>();

/** 허가정보 상세 → 용법용량·효능효과 텍스트 + 용법 자동 입력 후보 */
export async function getDetail(itemSeq: string, category = ''): Promise<DetailResult> {
  const hit = detailCache.get(itemSeq);
  if (hit) return hit;
  const rows = await callApi(DETAIL_URL, { item_seq: itemSeq, numOfRows: '1' }, 55000);
  const r = rows[0];
  if (!r) throw new Error('허가정보 상세를 찾을 수 없습니다.');
  const ud = docXmlToText(String(r.UD_DOC_DATA ?? ''));
  const data: DetailResult = {
    itemSeq,
    itemName: pick(r, 'ITEM_NAME'),
    ud,
    ee: docXmlToText(String(r.EE_DOC_DATA ?? '')),
    se: sideEffectSection(String(r.NB_DOC_DATA ?? '')),
    candidates: parseDosage(ud, { itemName: pick(r, 'ITEM_NAME'), category })
  };
  detailCache.set(itemSeq, data);
  if (detailCache.size > 500) detailCache.delete(detailCache.keys().next().value!);
  return data;
}

export interface SearchResult {
  items: Drug[];
  warnings: string[];
}

export async function searchMfds(q: string): Promise<SearchResult> {
  const key = q.trim();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  serviceKey(); // 키가 없으면 여기서 한 번만 오류

  const [easy, permit] = await Promise.allSettled([
    callApi(EASY_URL, { itemName: key, numOfRows: '30' }),
    callApi(PERMIT_URL, { item_name: key, numOfRows: '30' })
  ]);

  const warnings: string[] = [];
  if (easy.status === 'rejected') warnings.push(`e약은요: ${(easy.reason as Error).message}`);
  if (permit.status === 'rejected') warnings.push(`허가정보: ${(permit.reason as Error).message}`);
  if (easy.status === 'rejected' && permit.status === 'rejected') throw new Error(warnings.join(' / '));

  const byId = new Map<string, { info: MfdsInfo; name: string; eng: string; cat: string }>();

  for (const r of permit.status === 'fulfilled' ? permit.value : []) {
    const itemSeq = pick(r, 'ITEM_SEQ', 'itemSeq');
    const status = pick(r, 'CANCEL_NAME');
    if (!itemSeq || (status && status !== '정상')) continue; // 취소·취하 품목 제외
    byId.set(itemSeq, {
      name: pick(r, 'ITEM_NAME'),
      // 영문명은 제품명만 사용 (환자에게는 제품명으로 안내). 비어 있으면 화면에서 한글 제품명을 자동 번역
      // ITEM_INGR_NAME(영문 성분명)은 대신 쓰지 않음 — 예: 버제니오가 "Abemaciclib"로 나오던 문제
      eng: pick(r, 'ITEM_ENG_NAME'),
      cat: pick(r, 'PRDUCT_TYPE'),
      info: {
        itemSeq,
        entpName: pick(r, 'ENTP_NAME'),
        etcOtc: pick(r, 'SPCLTY_PBLC'),
        ingredient: pick(r, 'ITEM_INGR_NAME'),
        image: pick(r, 'BIG_PRDT_IMG_URL') || undefined
      }
    });
  }

  for (const r of easy.status === 'fulfilled' ? easy.value : []) {
    const itemSeq = pick(r, 'itemSeq');
    if (!itemSeq) continue;
    const prev = byId.get(itemSeq);
    byId.set(itemSeq, {
      name: prev?.name || pick(r, 'itemName'),
      eng: prev?.eng || '',
      cat: prev?.cat || '',
      info: {
        ...prev?.info,
        itemSeq,
        entpName: prev?.info.entpName || pick(r, 'entpName'),
        etcOtc: prev?.info.etcOtc || '일반의약품',
        efcy: pick(r, 'efcyQesitm'),
        useMethod: pick(r, 'useMethodQesitm'),
        atpnWarn: pick(r, 'atpnWarnQesitm'),
        atpn: pick(r, 'atpnQesitm'),
        intrc: pick(r, 'intrcQesitm'),
        se: pick(r, 'seQesitm'),
        deposit: pick(r, 'depositMethodQesitm'),
        image: pick(r, 'itemImage') || prev?.info.image
      }
    });
  }

  const data: SearchResult = {
    items: [...byId.values()]
      .filter((v) => !isInjection(v.name)) // 내복·점안·외용만 다루므로 주사제 제외
      .map((v) => toDrug(v.info, v.name, v.eng, v.cat)),
    warnings
  };
  cache.set(key, { at: Date.now(), data });
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  return data;
}
