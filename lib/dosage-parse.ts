/* =========================================================
 * 식약처 용법용량 문장 → 폼 기본값 추정
 *  - e약은요 "사용법"(일반의약품) 또는 허가정보 UD_DOC_DATA(전문의약품 포함)
 *  - 규칙 기반 추정이므로 결과는 항상 약사가 확인·수정할 수 있어야 한다
 * ========================================================= */
import type { CycleKey, DosageCandidate, DrugDefaults, TimingKey, Tr, UnitKey } from '@/lib/types';

/* "21일 복용 후 7일 휴약" → 직접 입력 주의사항 제안 문장 (7의 배수면 주 단위) */
const durEn = (n: number) =>
  n % 7 === 0 ? `${n / 7} ${n === 7 ? 'week' : 'weeks'}` : `${n} ${n === 1 ? 'day' : 'days'}`;
const durEnAdj = (n: number) => (n % 7 === 0 ? `${n / 7}-week` : `${n}-day`);
const durKo = (n: number) => (n % 7 === 0 ? `${n / 7}주` : `${n}일`);
export const restHintOf = (on: number, off: number): Tr => ({
  en: `Take it for ${durEn(on)}, then stop for ${durEn(off)}. Repeat this ${durEnAdj(on + off)} cycle.`,
  ko: `${durKo(on)}간 복용한 후 ${durKo(off)}간 쉬세요(${durKo(on + off)} 주기로 반복).`
});
/* 활성약 N일 + 위약 M일 (경구피임제 등): 쉬는 것이 아니라 위약까지 순서대로 계속 복용 */
export const placeboHintOf = (on: number, off: number): Tr => ({
  en: `Take the pills in the order shown on the pack: ${durEn(on)} of active pills, then ${durEn(off)} of inactive (placebo) pills. Do not skip any pill.`,
  ko: `포장에 표시된 순서대로 복용하세요. 활성약 ${durKo(on)} 복용 후 위약 ${durKo(off)}을 이어서 먹습니다(빠뜨리지 마세요).`
});

const toDays = (n: string, u: string) => Number(n) * (u === '주' ? 7 : 1);

/** "21일간 … 복용하고, 7일간 휴약" 같은 휴약 주기 → [복용일, 휴약일] */
function restCycleOf(s: string): [number, number] | null {
  const off = /(\d+)\s*(일|주)\s*(?:간|동안)?\s*(?:휴약|휴지|휴식|쉬)/.exec(s);
  if (!off) return null;
  const before = s.slice(0, off.index);
  const ons = [...before.matchAll(/(\d+)\s*(일|주)\s*(?:간|동안)/g)].filter((m) =>
    /투여|복용/.test(before.slice(m.index! + m[0].length))
  );
  const on = ons[ons.length - 1];
  return on ? [toDays(on[1], on[2]), toDays(off[1], off[2])] : null;
}

/** "24일동안은 …(활성약), 이후 4일 동안은 …(위약)" → [활성약일, 위약일] */
function placeboCycleOf(s: string): [number, number] | null {
  const m = s.match(
    /(\d+)\s*(일|주)\s*(?:간|동안)\s*(?:은|는)?[^.。\n]{0,20}?(?:활성|유효)[^.。\n]*?(\d+)\s*(일|주)\s*(?:간|동안)\s*(?:은|는)?[^.。\n]{0,20}?(?:위약|비활성)/
  );
  return m ? [toDays(m[1], m[2]), toDays(m[3], m[4])] : null;
}

/** 허가정보 XML(<DOC><SECTION><ARTICLE><PARAGRAPH><![CDATA[..]]>) → 줄 단위 텍스트 */
export function docXmlToText(xml: string): string {
  if (!xml) return '';
  const lines: string[] = [];
  const re = /<ARTICLE[^>]*title="([^"]*)"|<!\[CDATA\[([\s\S]*?)\]\]>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const t = (m[1] ?? m[2] ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/[ \t]+/g, ' ')
      .trim();
    if (t) lines.push(t);
  }
  return lines.join('\n');
}

export interface ParseHints {
  itemName?: string; // 함량 계산용 (예: "키스칼리정200밀리그램")
  category?: string; // 분류 (예: "항악성종양제") — 항암·호르몬제 기본 시점 판단
}

const RANGE = '[~\\-–～〜]';
const UNIT_WORD: [RegExp, UnitKey][] = [
  [/캡슐/, 'cap'],
  [/정/, 'tab'],
  [/포/, 'pkt'],
  [/m[lL]|밀리리터/, 'ml'],
  [/방울/, 'drop']
];
const unitOf = (w: string): UnitKey | undefined => UNIT_WORD.find(([re]) => re.test(w))?.[1];

// 식사와 무관: "식사와 관계없이", "식사와 상관없이", "음식과 함께 또는 무관하게", "음식물 섭취와 관계없이" 등
const FOOD_FREE =
  /(식사|음식물?|음식\s*섭취|식이)[와과의]?\s*(?:섭취\s*)?(?:여부\s*)?(?:와\s*)?(?:함께\s*또는\s*)?(?:관계\s*없이|상관\s*없이|무관하게|무관)/;

/** 시점 추정 결과: 목록 값, 또는 목록에 없으면 직접 입력 문구 */
type TimingGuess = { key: TimingKey } | { key: 'custom'; text: Tr };
const k = (key: TimingKey): TimingGuess => ({ key });
const c = (en: string, ko: string): TimingGuess => ({ key: 'custom', text: { en, ko } });
const FOOD_ANY = c('with or without food', '식사와 관계없이');
const WITH_FOOD = k('with_meal');

/** "12시간마다", "약 12시간 간격" → 6/8/12/24시간 */
function hourly(s: string): TimingGuess | undefined {
  const m = s.match(/(\d+)\s*시간\s*(?:마다|간격)/);
  const h = m ? Number(m[1]) : 0;
  if (h === 6) return k('q6h');
  if (h === 8) return k('q8h');
  if (h === 12) return k('q12h');
  if (h === 24) return k('same_time');
  return undefined;
}

/** 문장 안의 시점 표현 */
function timingOf(s: string, freq: number | null): TimingGuess | undefined {
  if (FOOD_FREE.test(s)) return freq === 1 ? k('same_time') : FOOD_ANY;
  if (/매일\s*같은\s*시간|일정한\s*시간/.test(s)) return k('same_time');
  if (/식후\s*및\s*취침\s*전|매\s*식후\s*및\s*취침/.test(s)) return k('after_bed');
  if (/취침\s*전|자기\s*전|잠자리에\s*들기\s*전/.test(s)) return k('bedtime');
  if (/아침\s*식사?\s*후|아침\s*식후/.test(s)) return c('after breakfast', '아침 식사 후에');
  // "식전 30분", "음식물 … 섭취 최소한 30분 전" (비스포스포네이트 등)
  if (/식전\s*30\s*분|식사\s*30\s*분\s*전|(?:음식물?|식사)[^.。\n]{0,30}?30\s*분\s*전/.test(s)) return k('before_30');
  if (/식전\s*1\s*시간|식사\s*1\s*시간\s*전|(?:음식물?|식사)[^.。\n]{0,30}?1\s*시간\s*전/.test(s)) return k('before_1h');
  if (/공복/.test(s)) return k('empty');
  if (/식간|식후\s*2\s*시간/.test(s)) return k('after_2h');
  if (/식후\s*즉시|식사\s*직후/.test(s)) return k('after_now');
  // "식사와 함께", "식사와 다량의 물과 함께 복용"
  if (/식사\s*(?:와\s*)?함께|식사[와과][^.。\n]{0,12}?함께\s*(?:복용|투여)|식사\s*중|음식과\s*함께\s*복용/.test(s)) return WITH_FOOD;
  if (/식후\s*30\s*분|식후/.test(s)) return k('after_30');
  const h = hourly(s);
  if (h) return h;
  // "1일 2회(아침, 저녁)"의 아침은 시점이 아니라 나눠 먹는 때이므로 1일 1회일 때만
  if (freq === 1 && /아침/.test(s)) return c('in the morning', '아침에');
  return undefined;
}

/** 문서 전체에서 찾을 때는 복용 방법을 직접 말하는 확실한 표현만 사용 */
function timingOfDoc(doc: string, freq: number | null): TimingGuess | undefined {
  if (FOOD_FREE.test(doc)) return freq === 1 ? k('same_time') : FOOD_ANY;
  if (/(?:식사|음식)[와과]?[^.。\n]{0,12}?함께\s*(?:[^.。\n]{0,20})?(?:복용|투여)/.test(doc)) return WITH_FOOD;
  if (/공복(?:에|\s*시)?\s*(?:복용|투여)/.test(doc)) return k('empty');
  if (/식후\s*30\s*분/.test(doc)) return k('after_30');
  if (/취침\s*전(?:에)?\s*(?:복용|투여)/.test(doc)) return k('bedtime');
  return undefined;
}

/** 제품명의 1정 함량(mg): "키스칼리정200밀리그램" → 200 */
function strengthMg(name = ''): number | null {
  const m = name.replace(/\([^)]*\)/g, '').match(/(\d+(?:\.\d+)?)\s*(?:mg|밀리그램|밀리그람)/i);
  return m ? Number(m[1]) : null;
}

/** 한 문장에서 용법 요소 추출 */
function parseSentence(s: string, whole: string, hints: ParseHints): DosageCandidate | null {
  // 감량·증량·조절, 금지("~해서는 안 된다"), 복용을 잊은 경우 같은 문장은 기본 용법이 아님
  if (/감량|증량|용량\s*조절|감소시|중단한다|이상반응\s*발생/.test(s)) return null;
  if (/안\s*된다|안\s*됩니다|하지\s*않는다|하지\s*마십시오|잊어버린|잊은\s*경우|놓친\s*경우/.test(s)) return null;
  const def: DrugDefaults = {};
  const fields: DosageCandidate['fields'] = [];

  // 1일 N회 / 하루 N번 / "1일 20~40mg을 2회로 분할"
  const fm =
    s.match(new RegExp(`(?:1일|하루)\\s*(\\d+)\\s*(?:${RANGE}\\s*(\\d+)\\s*)?(?:회|번)`)) ??
    s.match(new RegExp(`(?:1일|하루)[^.。\\n]{0,30}?(\\d+)\\s*(?:${RANGE}\\s*(\\d+)\\s*)?회\\s*(?:\\([^)]*\\))?\\s*(?:로|으로)?\\s*분할`));
  // "1일 1정씩"처럼 '회' 없이 1일 1개로 적힌 경우는 1일 1회
  const freqLo = fm ? Number(fm[1]) : /(?:1일|하루)\s*1\s*(?:정|캡슐|포)\s*씩?(?!\d)/.test(s) ? 1 : null;
  const freqHi = fm?.[2] ? Number(fm[2]) : freqLo;

  // 1회 N정 / (200 mg 필름코팅정 2정) / 2정씩 / 1회 1병(30 mL)
  const qm =
    s.match(new RegExp(`1회\\s*(\\d+(?:\\.\\d+)?)\\s*(?:${RANGE}\\s*\\d+(?:\\.\\d+)?\\s*)?(정|캡슐|포|m[lL]|방울)`)) ??
    s.match(/(\d+(?:\.\d+)?)\s*(정|캡슐|포|방울)\s*\)/) ??
    s.match(/(\d+(?:\.\d+)?)\s*(정|캡슐|포|방울)\s*(?:씩|을|를)/) ??
    s.match(/1회\s*\d+\s*병\s*\(\s*(\d+(?:\.\d+)?)\s*(m[lL])\s*\)/);
  const halfTab = /1회\s*(?:1\/2|반)\s*정/.test(s);

  // mg 용량만 있으면 제품 함량으로 정 수 계산: 1일 1회 400 mg ÷ 200 mg = 2정
  let mgQty: number | null = null;
  if (!qm && !halfTab) {
    const strength = strengthMg(hints.itemName);
    const dm =
      s.match(/1회\s*([\d,]+(?:\.\d+)?)\s*mg(?!\s*\/)/i) ??
      s.match(/1일\s*1\s*회\s*([\d,]+(?:\.\d+)?)\s*mg(?!\s*\/)/i);
    if (strength && dm) {
      const q = Number(dm[1].replace(/,/g, '')) / strength;
      if (Number.isInteger(q) && q >= 1 && q <= 10) mgQty = q;
    }
  }

  // 휴약 주기(21일 복용 후 7일 휴약) 또는 활성약/위약 주기(24일 + 4일)
  const placebo = placeboCycleOf(s);
  const rest = placebo ? null : restCycleOf(s);

  // 투여 주기: 주 1회 / 격일 (그 밖의 휴약 주기는 약사가 직접 입력)
  const cycle: CycleKey | undefined =
    /(?:주|1주|1\s*주일|일주일|매주)\s*(?:에\s*)?(?:1|한)\s*(?:회|번)/.test(s) ? 'weekly'
      : /격일|이틀에\s*(?:1|한)\s*(?:회|번)|2일\s*(?:에|마다)\s*1\s*회/.test(s) ? 'alt'
        : undefined;

  const prn = /필요시|필요할\s*때|증상이\s*있을\s*때/.test(s);
  const intervalM = s.match(new RegExp(`(\\d+)\\s*(?:${RANGE}\\s*\\d+\\s*)?시간\\s*(?:마다|간격)`));
  if (freqLo == null && !qm && !halfTab && !cycle && !rest && !placebo && !(prn && intervalM)) return null;
  if (prn) {
    def.freq = 'prn';
    fields.push('freq');
    if (freqHi) { def.max = freqHi; fields.push('maxDaily'); }
    if (intervalM) { def.interval = Number(intervalM[1]); fields.push('interval'); }
  } else if (cycle === 'weekly') {
    def.freq = '1'; // 복용하는 날 1회
  } else if (freqLo != null && freqLo >= 1 && freqLo <= 6) {
    def.freq = String(freqLo);
    fields.push('freq');
  }

  if (halfTab) {
    def.qty = 0.5; def.unit = 'tab'; fields.push('qty', 'unit');
  } else if (qm) {
    const q = Number(qm[1]);
    const u = unitOf(qm[2]);
    if (q > 0 && q <= (u === 'ml' ? 100 : 20)) { def.qty = q; fields.push('qty'); }
    if (u) { def.unit = u; fields.push('unit'); }
  } else if (mgQty) {
    def.qty = mgQty; fields.push('qty');
  }

  if (cycle && !prn) { def.cycle = cycle; fields.push('cycle'); }

  // 복용 시점: 이 문장 → 문서 전체(확실한 표현만) → 항암·호르몬제 1일 1회면 매일 같은 시간
  const once = freqLo === 1 || cycle === 'weekly';
  let t = timingOf(s, once ? 1 : freqLo) ?? timingOfDoc(whole, once ? 1 : freqLo);
  if (!t && freqLo === 1 && !cycle && /종양|항암|호르몬|피임/.test(hints.category ?? '')) t = k('same_time');
  // "매일 같은 시간"은 주 1회·격일과 맞지 않으므로 "식사와 관계없이"로
  if (t?.key === 'same_time' && cycle) t = FOOD_ANY;
  // 주 1회·격일의 "12시간 간격으로 나누어"는 분할 복용 설명이지 시점이 아님
  if (cycle && t && (t.key === 'q6h' || t.key === 'q8h' || t.key === 'q12h')) t = undefined;
  if (t && !prn) {
    def.timing = t.key;
    if (t.key === 'custom') def.timingText = t.text;
    fields.push('timing');
  }

  return { text: s.trim(), def, fields, ...(placebo ? { restHint: placeboHintOf(placebo[0], placebo[1]) } : rest ? { restHint: restHintOf(rest[0], rest[1]) } : {}) };
}

/** 후보 정렬 점수: 권장 용법·완전한 용법 우선, 특수 환자군·병용은 뒤로 */
function score(c: DosageCandidate): number {
  let n = 0;
  if (/권장/.test(c.text)) n += 2;
  if (c.def.freq) n += 2;
  if (c.def.qty) n += 1;
  if (c.def.cycle || c.restHint) n += 1;
  if (/간장애|신장애|간기능|신기능|소아|노인|고령|병용|투석/.test(c.text)) n -= 3;
  return n;
}

// "1일 5회를 초과하지 않는다", "하루 4회까지만" → 기본 용법이 아니라 1일 최대 횟수
const LIMIT = /초과\s*(?:하지|하여|해서)|넘지\s*않|넘기지|까지만|이내로\s*(?:복용|투여)/;

/** 용법용량 텍스트 → 후보 목록 (같은 결과는 하나로, 좋은 후보 먼저) */
export function parseDosage(text: string, hints: ParseHints = {}): DosageCandidate[] {
  if (!text) return [];
  const sentences = text
    .split(/\n|(?<=다\.)\s+|(?<=\.)\s+(?=[가-힣])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);

  // 최대 횟수 제한 문장은 따로 모아 필요시 복용 후보에 붙임
  let limitMax: number | null = null;
  const body: string[] = [];
  for (const s of sentences) {
    const lm = LIMIT.test(s) && s.match(/(?:1일|하루)\s*(?:최대\s*)?(\d+)\s*(?:회|번)/);
    if (lm) { limitMax ??= Number(lm[1]); continue; }
    body.push(s);
  }

  const seen = new Set<string>();
  const out: DosageCandidate[] = [];
  for (const s of body) {
    const c = parseSentence(s, text, hints);
    if (c && c.def.freq === 'prn' && c.def.max == null && limitMax) {
      c.def.max = limitMax;
      c.fields.push('maxDaily');
    }
    if (!c || !c.fields.length) continue;
    const key = JSON.stringify(c.def);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out
    .map((c, i) => ({ c, i, s: score(c) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, 6)
    .map((x) => x.c);
}
