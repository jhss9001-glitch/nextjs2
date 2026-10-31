import {
  emptyInfo,
  emptyTexts,
  type DosageCandidate,
  type PatientInfo,
  type Drug,
  type DrugDefaults,
  type FormState,
  type GeneralKey,
  type Item,
  type Route,
  type Tr
} from '@/lib/types';

/** 기본값 적용 (점안은 단위 '방울' 고정) */
export function makeForm(def: DrugDefaults, general: GeneralKey[], route: Route): FormState {
  const texts = emptyTexts();
  if (def.timing === 'custom' && def.timingText) texts.timing = { ...def.timingText };
  return {
    route,
    unit: route === 'eye' ? 'drop' : def.unit || 'tab',
    qty: String(def.qty || 1),
    freq: def.freq || '3',
    timing: def.timing || 'after_30',
    days: def.days != null ? String(def.days) : '',
    interval: def.interval != null ? String(def.interval) : '',
    maxDaily: def.max != null ? String(def.max) : '',
    cycle: def.cycle ?? '',
    texts,
    info: emptyInfo(),
    general,
    notes: [],
    photo: true
  };
}

/** 환자 설명에서 한국어는 있는데 영어 번역이 아직 없는 항목 이름들 */
export function missingInfo(info: PatientInfo): string[] {
  const pending = (t: Tr) => !!t.ko.trim() && !t.en.trim();
  const hide = info.hide ?? {}; // 안내문에서 뺀 항목은 번역이 없어도 됨
  const out: string[] = [];
  if (!hide.purpose && pending(info.purpose)) out.push('무슨 약인지');
  if (!hide.sideEffects && info.sideEffects.some(pending)) out.push('부작용');
  if (!hide.serious && pending(info.serious)) out.push('병원에 가야 할 때');
  return out;
}

/** 저장용으로 정리: 앞뒤 공백 제거, 빈 부작용 줄 제거 */
const cleanInfo = (info: PatientInfo): PatientInfo => ({
  purpose: trimTr(info.purpose),
  sideEffects: info.sideEffects.map(trimTr).filter((t) => t.ko || t.en),
  serious: trimTr(info.serious),
  hide: { ...info.hide }
});

/** 점안은 단위 '방울' 고정 (용량 '선택 안 함'은 그대로) */
const eyeUnit = (u: FormState['unit']) => (u === 'none' ? 'none' : 'drop');

export const defaultForm = (route: Route): FormState =>
  makeForm({ unit: 'tab', qty: 1, freq: '3', timing: 'after_30', days: '', interval: 4, max: '' }, [], route);

/** 식약처 용법 후보를 현재 폼에 덮어쓰기 (후보가 추정한 칸만) */
export function applyCandidate(form: FormState, c: DosageCandidate): FormState {
  const d = c.def;
  const next = { ...form, texts: { ...form.texts } };
  if (d.freq) next.freq = d.freq;
  if (d.qty) next.qty = String(d.qty);
  if (d.unit && form.route !== 'eye') next.unit = d.unit;
  if (d.timing) {
    next.timing = d.timing;
    if (d.timing === 'custom' && d.timingText) next.texts.timing = { ...d.timingText };
  }
  if (d.interval != null) next.interval = String(d.interval);
  if (d.max != null) next.maxDaily = String(d.max);
  // 직접 입력한 주기 문장은 건드리지 않음
  if (form.cycle !== 'custom') next.cycle = d.cycle ?? '';
  return next;
}

/** '직접 입력'을 골랐는데 아직 번역(영어)이 없는 칸 이름들 (목록 추가 전 확인용) */
export function missingCustom(form: FormState): string[] {
  const t = form.texts;
  const prn = form.freq === 'prn';
  const out: string[] = [];
  if (form.route === 'custom' && !t.route.en.trim()) out.push('사용 경로');
  if (form.route !== 'topical' && form.unit === 'custom' && !t.unit.en.trim()) out.push('단위');
  if (form.freq === 'custom' && form.cycle !== 'weekly' && !t.freq.en.trim()) out.push('1일 횟수');
  if (!prn && form.route !== 'eye' && form.route !== 'topical' && form.timing === 'custom' && !t.timing.en.trim()) out.push('복용 시점');
  if (!prn && form.cycle === 'custom' && !t.cycle.en.trim()) out.push('투여 주기');
  return out;
}

const trimTr = (tr: { en: string; ko: string }) => ({ en: tr.en.trim(), ko: tr.ko.trim() });

/** 현재 입력값 → 항목 */
export function buildItem(drug: Drug | null, custom: boolean, customName: Tr, form: FormState): Item {
  const route = form.route;
  const qty = Math.max(0.5, Number(form.qty) || 1);
  const prn = form.freq === 'prn';
  const cycle = prn ? '' : form.cycle;
  const t = form.texts;
  return {
    drug,
    customName: custom ? trimTr(customName) : { en: '', ko: '' },
    route,
    qty,
    unit: route === 'eye' ? eyeUnit(form.unit) : form.unit,
    // 주 1회는 복용하는 날 1회로 처리
    freq: cycle === 'weekly' ? '1' : form.freq,
    timing: form.timing,
    days: form.days ? Number(form.days) : null,
    interval: form.interval ? Number(form.interval) : null,
    max: form.maxDaily ? Number(form.maxDaily) : null,
    cycle,
    texts: {
      route: trimTr(t.route),
      unit: trimTr(t.unit),
      freq: trimTr(t.freq),
      timing: trimTr(t.timing),
      cycle: trimTr(t.cycle)
    },
    info: cleanInfo(form.info),
    general: form.general,
    notes: form.notes,
    photo: form.photo
  };
}

/** 목록 항목 → 폼 (수정 시작) */
export function itemToForm(it: Item): FormState {
  return {
    route: it.route,
    unit: it.route === 'eye' ? eyeUnit(it.unit) : it.unit,
    qty: String(it.qty || 1),
    freq: it.freq,
    timing: it.timing,
    days: String(it.days ?? ''),
    interval: String(it.interval ?? ''),
    maxDaily: String(it.max ?? ''),
    cycle: it.cycle,
    texts: {
      route: { ...it.texts.route },
      unit: { ...it.texts.unit },
      freq: { ...it.texts.freq },
      timing: { ...it.texts.timing },
      cycle: { ...it.texts.cycle }
    },
    info: {
      purpose: { ...it.info.purpose },
      sideEffects: it.info.sideEffects.map((s) => ({ ...s })),
      serious: { ...it.info.serious },
      hide: { ...it.info.hide }
    },
    general: it.general,
    notes: it.notes,
    photo: it.photo ?? true
  };
}
