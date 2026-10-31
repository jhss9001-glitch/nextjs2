import { GENERAL, TIMINGS, UNITS } from '@/data/rx-data';
import type { Item, Lang, TimingKey, Tr, UnitKey } from '@/lib/types';

export const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

/** 직접 입력 문구: 한국어는 한국어 → 없으면 영어, 영어는 번역 결과 → 아직 없으면 자리표시 */
export const tx = (tr: Tr, lang: Lang) => (lang === 'en' ? tr.en : tr.ko || tr.en).trim() || '…';

/** 문장 끝에 마침표가 없으면 붙임 */
const endDot = (s: string) => (/[.!?。]$/.test(s) ? s : `${s}.`);

/** '선택 안 함'으로 빈 칸이 생긴 문장 정리: 겹친 공백·쉼표, 문장 앞 쉼표, ", ." → "." */
export const tidy = (s: string) =>
  s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/,(?:\s*,)+/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/^[\s,]+/, '')
    .trim();

/** 용량을 '선택 안 함'으로 했을 때 영어 문장에 대신 넣는 말 */
export const NO_DOSE_EN = 'this medicine';
const doseKo = (q: string) => (q ? `1회 ${q}씩` : '');

/** 영어 뒷부분: 있는 것만 쉼표로 — "3 times a day, after meals, for 5 days" / 횟수 없으면 "after meals, for 5 days" */
export const enTail = (f: string, t: string, d?: number | null) =>
  [f, t, d ? `for ${d} ${d > 1 ? 'days' : 'day'}` : ''].filter(Boolean).join(', ');
/** 한국어 앞부분: 횟수 뒤에 이어지는 말이 있을 때만 쉼표 — "1일 3회, 1회 1정씩" / "1일 3회 사용하세요" */
export const koHead = (f: string, rest: string) => (f && rest.trim() ? `${f}, ${rest}` : `${f} ${rest}`);

export function qtyText(q: number, unitKey: UnitKey, lang: Lang): string {
  const u = UNITS[unitKey];
  if (q === 0.5 && u.half) return u.half[lang];
  const n = fmtNum(q);
  if (lang === 'en') return `${n} ${q <= 1 ? u.en[0] : u.en[1]}`;
  return `${n}${u.ko}`;
}

/** 1회 용량 (직접 입력한 단위 포함) */
export function qtyOf(it: Item, lang: Lang): string {
  if (it.unit === 'none') return ''; // 용량 선택 안 함
  if (it.unit !== 'custom') return qtyText(it.qty, it.unit, lang);
  const n = fmtNum(it.qty);
  if (lang === 'ko') return `${n}${tx(it.texts.unit, 'ko')}`;
  // 번역 결과는 "단수|복수" (예: "puff|puffs")
  const [sg, pl = sg] = tx(it.texts.unit, 'en').split('|');
  return `${n} ${it.qty <= 1 ? sg : pl}`;
}

/** 직접 입력한 사용 경로 + 용량: "Insert {dose} into the vagina" → "Insert 1 tablet into the vagina" */
export const routePhrase = (it: Item, q: string) => {
  if (it.route === 'none') return `Use ${q || NO_DOSE_EN}`; // 경로 선택 안 함 → 일반적인 "사용하세요"
  q = q || NO_DOSE_EN;
  const v = tx(it.texts.route, 'en');
  return v.includes('{dose}') ? v.replace('{dose}', q) : `${v} ${q}`;
};

export function freqText(n: number, lang: Lang): string {
  if (lang === 'ko') return `1일 ${n}회`;
  return n === 1 ? 'once a day' : n === 2 ? 'twice a day' : `${n} times a day`;
}

/** 투여 주기·직접 입력을 반영한 횟수 표현: 매일 "1일 2회" / 격일 "격일로" / 주 1회 "주 1회" */
export function freqOf(it: Item, lang: Lang): string {
  if (it.cycle === 'weekly') return lang === 'ko' ? '주 1회' : 'once a week';
  const n = Number(it.freq);
  // 직접 입력한 횟수는 문장 중간에 들어가므로 끝의 마침표는 뗌 / 선택 안 함은 빈 문자열
  const base =
    it.freq === 'none' ? '' : it.freq === 'custom' ? tx(it.texts.freq, lang).replace(/[.。]$/, '') : freqText(n, lang);
  if (it.cycle === 'alt') {
    if (lang === 'ko') return n === 1 || !base ? '격일로' : `격일로 ${base}`;
    return n === 1 || !base ? 'every other day' : `${base}, every other day`;
  }
  return base;
}

/** 문장 배열 합치기 (한국어 병기용 빈 문장 제외) */
export const joinDir = (a: string[]) => a.filter(Boolean).join(' ');

export function timingText(key: TimingKey, n: number, lang: Lang, cycle: Item['cycle'] = ''): string {
  // 격일·주 1회 등 매일이 아닐 때 "매일 같은 시간"은 모순되므로 "같은 시간"으로
  if (key === 'same_time' && cycle) return lang === 'ko' ? '같은 시간에' : 'at the same time of day';
  const t = TIMINGS[key];
  if (lang === 'en' && n === 1 && t.en1) return t.en1;
  return t[lang];
}

/** 복용 시점 (직접 입력 포함) */
export function timingOf(it: Item, lang: Lang): string {
  if (it.timing === 'none') return '';
  if (it.timing === 'custom') return tx(it.texts.timing, lang);
  const n = it.cycle === 'weekly' ? 1 : Number(it.freq);
  return timingText(it.timing, n, lang, it.cycle);
}

/** 직접 입력한 사용 경로의 한국어 동사: "흡입하세요" (비면 "사용하세요") */
export const routeVerbKo = (it: Item) => (it.route === 'custom' && it.texts.route.ko.trim()) || '사용하세요';

type Fn<A extends unknown[]> = Record<Lang, (...a: A) => string>;

// 횟수(f)·용량(q)·시점(t)은 '선택 안 함'이면 빈 문자열 → tidy로 문장 정리
const S = {
  oral: {
    ko: (f, q, t, d) => tidy(`${koHead(f, `${doseKo(q)} ${t} ${d ? `${d}일간` : ''}`)} 복용하세요.`),
    en: (f, q, t, d) => tidy(`Take ${q || NO_DOSE_EN} ${enTail(f, t, d)}.`)
  } as Fn<[string, string, string, number | null]>,
  oralPrn: {
    ko: (q) => tidy(`증상이 있을 때 ${doseKo(q)} 복용하세요.`),
    en: (q) => `Take ${q || NO_DOSE_EN} when needed (when you have symptoms).`
  } as Fn<[string]>,
  eye: {
    ko: (f, q) => tidy(`${koHead(f, doseKo(q))} 눈에 점안하세요.`),
    en: (f, q) => tidy(`Put ${q || 'the drops'} in the affected eye(s) ${f}.`)
  } as Fn<[string, string]>,
  eyePrn: {
    ko: (q) => tidy(`필요할 때 ${doseKo(q)} 눈에 점안하세요.`),
    en: (q) => `Put ${q || 'the drops'} in the affected eye(s) when needed.`
  } as Fn<[string]>,
  topical: {
    ko: (f) => tidy(`${f}, 환부에 적당량을 얇게 바르세요.`),
    en: (f) => tidy(`Apply a thin layer to the affected area ${f}.`)
  } as Fn<[string]>,
  topicalPrn: {
    ko: () => '필요할 때 환부에 적당량을 얇게 바르세요.',
    en: () => 'Apply a thin layer to the affected area when needed.'
  } as Fn<[]>,
  // 직접 입력한 사용 경로: ko는 v = "흡입하세요", en은 v = 용량이 들어간 동사구 ("Inhale 2 puffs")
  custom: {
    ko: (v, f, q, t, d) => endDot(tidy(`${koHead(f, `${doseKo(q)} ${t} ${d ? `${d}일간` : ''}`)} ${v}`)),
    en: (v, f, _q, t, d) => tidy(`${v} ${enTail(f, t, d)}.`)
  } as Fn<[string, string, string, string, number | null]>,
  customPrn: {
    ko: (v, q) => endDot(tidy(`필요할 때 ${doseKo(q)} ${v}`)),
    en: (v) => `${v} when needed.`
  } as Fn<[string, string]>,
  interval: {
    ko: (h) => `복용 간격은 최소 ${h}시간 이상 두세요.`,
    en: (h) => `Wait at least ${h} hours between doses.`
  } as Fn<[number]>,
  max: {
    ko: (m) => `하루 ${m}회를 넘기지 마세요.`,
    en: (m) => (m === 1 ? 'Do not use more than once a day.' : `Do not use more than ${m} times a day.`)
  } as Fn<[number]>,
  supply: {
    ko: (d) => `${d}일분입니다.`,
    en: (d) => `This is a ${d}-day supply.`
  } as Fn<[number]>,
  useFor: {
    ko: (d) => `${d}일간 사용하세요.`,
    en: (d) => `Use for ${d} ${d > 1 ? 'days' : 'day'}.`
  } as Fn<[number]>
};

export function directions(it: Item, lang: Lang): string[] {
  const out: string[] = [];
  const prn = it.freq === 'prn';
  const q = qtyOf(it, lang);
  const f = prn ? '' : freqOf(it, lang);
  // 매일이 아니면 "N일간 복용"은 헷갈리므로 아래에서 "N일분"으로 따로 안내
  const notDaily = !prn && it.cycle !== '';
  const inlineDays = notDaily ? null : it.days;
  const takeLike = it.route === 'oral' || it.route === 'custom' || it.route === 'none'; // 기간을 문장 안에 넣는 경로

  if (it.route === 'oral') {
    if (prn) {
      out.push(S.oralPrn[lang](q));
      if (it.interval) out.push(S.interval[lang](it.interval));
    } else {
      out.push(S.oral[lang](f, q, timingOf(it, lang), inlineDays));
    }
  } else if (it.route === 'eye') {
    out.push(prn ? S.eyePrn[lang](q) : S.eye[lang](f, q));
  } else if (it.route === 'topical') {
    out.push(prn ? S.topicalPrn[lang]() : S.topical[lang](f));
  } else {
    const v = lang === 'en' ? routePhrase(it, q) : routeVerbKo(it);
    if (prn) {
      out.push(S.customPrn[lang](v, q));
      if (it.interval) out.push(S.interval[lang](it.interval));
    } else {
      out.push(S.custom[lang](v, f, q, timingOf(it, lang), inlineDays));
    }
  }

  // 직접 입력한 투여 주기 (한국어는 비어 있을 수 있음 — 줄 맞춤을 위해 빈 문장 유지)
  if (!prn && it.cycle === 'custom') out.push(it.texts.cycle[lang]);
  if (prn && it.max) out.push(S.max[lang](it.max));
  if (it.days && (prn || notDaily || !takeLike)) {
    out.push(takeLike ? S.supply[lang](it.days) : S.useFor[lang](it.days));
  }
  return out;
}

/**
 * 환자 설명(무슨 약·부작용·바로 병원에) — 영어 번역이 있는 항목만, 영어/한국어 같은 순서로
 * (한국어 병기를 줄 단위로 맞추기 위해 두 언어 모두 같은 필터를 씀)
 */
export function infoOf(it: Item) {
  const ok = (t: Tr) => !!t.en.trim();
  const hide = it.info.hide ?? {}; // '안내문에 넣지 않음'으로 끈 항목은 빼기
  return {
    purpose: !hide.purpose && ok(it.info.purpose) ? it.info.purpose : null,
    sideEffects: hide.sideEffects ? [] : it.info.sideEffects.filter(ok),
    serious: !hide.serious && ok(it.info.serious) ? it.info.serious : null
  };
}

/** 약품별 주의사항 + 공통 주의사항 + 직접 입력한 주의사항. ko는 비어 있을 수 있음 */
export function cautions(it: Item, lang: Lang): { t: string; ko: string }[] {
  const list = it.drug ? it.drug.warn.map((w) => ({ t: w[lang], ko: w.ko })) : [];
  it.general.forEach((g) => list.push({ t: GENERAL[g][lang], ko: GENERAL[g].ko }));
  it.notes.forEach((n) => list.push({ t: n[lang], ko: n.ko }));
  return list;
}

export function itemTitle(it: Item): string {
  return it.drug ? it.drug.brand : it.customName.ko;
}

/** 한글 제품명에서 괄호(성분명·수출명 등)를 뗀 이름: "키스칼리정200밀리그램(리보시클립숙신산염)" → "키스칼리정200밀리그램" */
// 괄호를 먼저 지운 뒤 쉼표로 자름 (괄호 안의 쉼표 "(수출명:A,B)" 때문에)
export const koProductName = (brand: string) => brand.replace(/\([^)]*\)/g, '').split(',')[0].trim() || brand;

/**
 * 안내문·스크립트에 표시할 약 이름
 *  - 영어: "영문명" 칸 (식약처 영문 제품명 또는 약사가 고친 이름) → 비면 한글 제품명
 *  - 한국어: 영어와 짝이 맞도록 한글 **제품명** (성분명이 아님)
 *  - 직접 입력한 약: 한국어 입력 / 번역된 영어
 */
export function itemName(it: Item, lang: Lang): string {
  if (it.drug) return lang === 'en' ? it.drug.ing.en || koProductName(it.drug.brand) : koProductName(it.drug.brand);
  return lang === 'en' ? it.customName.en || it.customName.ko : it.customName.ko;
}
