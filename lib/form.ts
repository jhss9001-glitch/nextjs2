import type { Drug, DrugDefaults, FormState, GeneralKey, Item, Route } from '@/lib/types';

/** 기본값 적용 (점안은 단위 '방울' 고정) */
export function makeForm(def: DrugDefaults, general: GeneralKey[], route: Route): FormState {
  return {
    route,
    unit: route === 'eye' ? 'drop' : def.unit || 'tab',
    qty: String(def.qty || 1),
    freq: def.freq || '3',
    timing: def.timing || 'after_30',
    days: def.days != null ? String(def.days) : '',
    interval: def.interval != null ? String(def.interval) : '',
    maxDaily: def.max != null ? String(def.max) : '',
    general,
    notes: []
  };
}

export const defaultForm = (route: Route): FormState =>
  makeForm({ unit: 'tab', qty: 1, freq: '3', timing: 'after_30', days: '', interval: 4, max: '' }, [], route);

/** 현재 입력값 → 항목 */
export function buildItem(drug: Drug | null, custom: boolean, customName: string, form: FormState): Item {
  const route = form.route;
  const qty = Math.max(0.5, Number(form.qty) || 1);
  return {
    drug,
    customName: custom ? customName.trim() : '',
    route,
    qty,
    unit: route === 'eye' ? 'drop' : form.unit,
    freq: form.freq,
    timing: form.timing,
    days: form.days ? Number(form.days) : null,
    interval: form.interval ? Number(form.interval) : null,
    max: form.maxDaily ? Number(form.maxDaily) : null,
    general: form.general,
    notes: form.notes
  };
}

/** 목록 항목 → 폼 (수정 시작) */
export function itemToForm(it: Item): FormState {
  return {
    route: it.route,
    unit: it.route === 'eye' ? 'drop' : it.unit,
    qty: String(it.qty || 1),
    freq: it.freq,
    timing: it.timing,
    days: String(it.days ?? ''),
    interval: String(it.interval ?? ''),
    maxDaily: String(it.max ?? ''),
    general: it.general,
    notes: it.notes
  };
}
