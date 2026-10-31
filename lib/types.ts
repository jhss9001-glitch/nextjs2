export type Lang = 'ko' | 'en' | 'zh' | 'ja';
export type OutLang = 'en' | 'zh' | 'ja';
export type TabLang = OutLang | 'all';
export type Route = 'oral' | 'eye' | 'topical';

export type UnitKey = 'tab' | 'cap' | 'pkt' | 'ml' | 'drop';
export type TimingKey =
  | 'after_30' | 'after_now' | 'before_30' | 'with_meal' | 'between' | 'empty'
  | 'morning' | 'morning_after' | 'bedtime' | 'after_bed' | 'anytime';
export type GeneralKey =
  | 'drowsy' | 'no_alcohol' | 'complete' | 'missed' | 'water' | 'swallow'
  | 'stop_rash' | 'consult' | 'shake' | 'fridge' | 'room' | 'child';
export type UiKey = 'title' | 'pharmacy' | 'purpose' | 'howto' | 'caution' | 'product' | 'footer';

export type Tr = Record<Lang, string>;

export interface Unit {
  label: string;
  ko: string;
  en: [string, string];
  zh: string;
  ja: string;
  half?: Tr;
}

export interface Timing {
  label: string;
  ko: string;
  en: string;
  en1?: string;
  zh: string;
  ja: string;
}

export interface DrugDefaults {
  unit?: UnitKey;
  qty?: number;
  freq?: string;
  timing?: TimingKey;
  days?: number | string | null;
  interval?: number | string | null;
  max?: number | string | null;
}

export interface Drug {
  id: string;
  brand: string;
  brandEn: string;
  aliases?: string[];
  cat: string;
  route: Route;
  ing: Tr;
  use: Tr;
  warn: Tr[];
  def: DrugDefaults;
  general?: GeneralKey[];
}

/** 조제 목록의 한 항목 (원본 readForm()의 반환 형태) */
export interface Item {
  drugId: string | null;
  customName: string;
  route: Route;
  qty: number;
  unit: UnitKey;
  freq: string; // '1'~'6' | 'prn'
  timing: TimingKey;
  days: number | null;
  interval: number | null;
  max: number | null;
  general: GeneralKey[];
}

/** 폼 입력값 (select/input의 문자열 값 그대로) */
export interface FormState {
  qty: string;
  unit: UnitKey;
  freq: string;
  timing: TimingKey;
  days: string;
  interval: string;
  maxDaily: string;
  general: GeneralKey[];
}

export interface ScriptBlock {
  label: string;
  lines: string[];
}
