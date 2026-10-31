import { GENERAL, TIMINGS, UNITS } from '@/data/rx-data';
import type { Item, Lang, TimingKey, UnitKey } from '@/lib/types';

export const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

export function qtyText(q: number, unitKey: UnitKey, lang: Lang): string {
  const u = UNITS[unitKey];
  if (q === 0.5 && u.half) return u.half[lang];
  const n = fmtNum(q);
  if (lang === 'en') return `${n} ${q <= 1 ? u.en[0] : u.en[1]}`;
  return `${n}${u.ko}`;
}

export function freqText(n: number, lang: Lang): string {
  if (lang === 'ko') return `1일 ${n}회`;
  return n === 1 ? 'once a day' : n === 2 ? 'twice a day' : `${n} times a day`;
}

export function timingText(key: TimingKey, n: number, lang: Lang): string {
  const t = TIMINGS[key];
  if (lang === 'en' && n === 1 && t.en1) return t.en1;
  return t[lang];
}

type Fn<A extends unknown[]> = Record<Lang, (...a: A) => string>;

const S = {
  oral: {
    ko: (f, q, t, d) => `${f}, 1회 ${q}씩 ${t} ${d ? `${d}일간 ` : ''}복용하세요.`,
    en: (f, q, t, d) => `Take ${q} ${f}, ${t}${d ? `, for ${d} ${d > 1 ? 'days' : 'day'}` : ''}.`
  } as Fn<[string, string, string, number | null]>,
  oralPrn: {
    ko: (q) => `증상이 있을 때 1회 ${q}씩 복용하세요.`,
    en: (q) => `Take ${q} when needed (when you have symptoms).`
  } as Fn<[string]>,
  eye: {
    ko: (f, q) => `${f}, 1회 ${q}씩 눈에 점안하세요.`,
    en: (f, q) => `Put ${q} in the affected eye(s) ${f}.`
  } as Fn<[string, string]>,
  eyePrn: {
    ko: (q) => `필요할 때 1회 ${q}씩 눈에 점안하세요.`,
    en: (q) => `Put ${q} in the affected eye(s) when needed.`
  } as Fn<[string]>,
  topical: {
    ko: (f) => `${f}, 환부에 적당량을 얇게 바르세요.`,
    en: (f) => `Apply a thin layer to the affected area ${f}.`
  } as Fn<[string]>,
  topicalPrn: {
    ko: () => '필요할 때 환부에 적당량을 얇게 바르세요.',
    en: () => 'Apply a thin layer to the affected area when needed.'
  } as Fn<[]>,
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
  const n = prn ? 0 : Number(it.freq);
  const q = qtyText(it.qty, it.unit, lang);

  if (it.route === 'oral') {
    if (prn) {
      out.push(S.oralPrn[lang](q));
      if (it.interval) out.push(S.interval[lang](it.interval));
    } else {
      out.push(S.oral[lang](freqText(n, lang), q, timingText(it.timing, n, lang), it.days));
    }
  } else if (it.route === 'eye') {
    out.push(prn ? S.eyePrn[lang](q) : S.eye[lang](freqText(n, lang), q));
  } else {
    out.push(prn ? S.topicalPrn[lang]() : S.topical[lang](freqText(n, lang)));
  }

  if (prn && it.max) out.push(S.max[lang](it.max));
  if (it.days && (prn || it.route !== 'oral')) {
    out.push(prn && it.route === 'oral' ? S.supply[lang](it.days) : S.useFor[lang](it.days));
  }
  return out;
}

/** 약품별 주의사항 + 공통 주의사항 + 직접 입력한 주의사항. ko는 비어 있을 수 있음 */
export function cautions(it: Item, lang: Lang): { t: string; ko: string }[] {
  const list = it.drug ? it.drug.warn.map((w) => ({ t: w[lang], ko: w.ko })) : [];
  it.general.forEach((g) => list.push({ t: GENERAL[g][lang], ko: GENERAL[g].ko }));
  it.notes.forEach((n) => list.push({ t: n[lang], ko: n.ko }));
  return list;
}

export function itemTitle(it: Item): string {
  return it.drug ? it.drug.brand : it.customName;
}

/** 안내문에 표시할 약 이름 */
export function itemName(it: Item, lang: Lang): string {
  return it.drug ? it.drug.ing[lang] || it.drug.brand : it.customName;
}
