import type { Drug, DrugDefaults, FormState, GeneralKey, Item, Route } from '@/lib/types';

/** 원본 applyDefaults + updateVisibility(점안은 단위 '방울' 고정)의 값 계산 부분 */
export function makeForm(def: DrugDefaults, general: GeneralKey[], route: Route): FormState {
  return {
    unit: route === 'eye' ? 'drop' : def.unit || 'tab',
    qty: String(def.qty || 1),
    freq: def.freq || '3',
    timing: def.timing || 'after_30',
    days: def.days != null ? String(def.days) : '',
    interval: def.interval != null ? String(def.interval) : '',
    maxDaily: def.max != null ? String(def.max) : '',
    general
  };
}

export const defaultForm = (route: Route): FormState =>
  makeForm({ unit: 'tab', qty: 1, freq: '3', timing: 'after_30', days: '', interval: 4, max: '' }, [], route);

export function currentRoute(drug: Drug | null, custom: boolean, customRoute: Route): Route {
  if (drug) return drug.route;
  if (custom) return customRoute;
  return 'oral';
}

/** 원본 readForm() */
export function buildItem(
  drug: Drug | null,
  custom: boolean,
  customName: string,
  customRoute: Route,
  form: FormState
): Item {
  const route = currentRoute(drug, custom, customRoute);
  const qty = Math.max(0.5, Number(form.qty) || 1);
  return {
    drugId: drug ? drug.id : null,
    customName: custom ? customName.trim() : '',
    route,
    qty,
    unit: route === 'eye' ? 'drop' : form.unit,
    freq: form.freq,
    timing: form.timing,
    days: form.days ? Number(form.days) : null,
    interval: form.interval ? Number(form.interval) : null,
    max: form.maxDaily ? Number(form.maxDaily) : null,
    general: form.general
  };
}
