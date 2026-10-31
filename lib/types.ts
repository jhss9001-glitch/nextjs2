export type Lang = 'ko' | 'en';
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
  half?: Tr;
}

export interface Timing {
  label: string;
  ko: string;
  en: string;
  en1?: string;
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

/** 식약처(e약은요·허가정보)에서 가져온 원문. 약사 참고용이며 영어 안내문에는 넣지 않음 */
export interface MfdsInfo {
  itemSeq: string;
  entpName: string;
  etcOtc?: string; // 전문/일반
  ingredient?: string; // 주성분
  efcy?: string; // 효능
  useMethod?: string; // 사용법
  atpnWarn?: string; // 사용 전 경고
  atpn?: string; // 주의사항
  intrc?: string; // 상호작용
  se?: string; // 부작용
  deposit?: string; // 보관법
  image?: string;
}

export interface Drug {
  id: string;
  brand: string;
  brandEn: string;
  aliases?: string[];
  cat: string;
  route: Route;
  ing: Tr; // en은 영어 안내문에 표시되는 약 이름
  use: Tr; // en이 비어 있으면 영어 안내문에서 효능을 생략
  warn: Tr[];
  def: DrugDefaults;
  general?: GeneralKey[];
  mfds?: MfdsInfo;
}

/** 조제 목록의 한 항목 */
export interface Item {
  drug: Drug | null; // 선택 당시의 약 정보 (식약처 약도 목록에 그대로 보관)
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
  notes: Tr[]; // 직접 입력한 주의사항 (en 필수, ko 선택)
}

/** 폼 입력값 */
export interface FormState {
  route: Route;
  qty: string;
  unit: UnitKey;
  freq: string;
  timing: TimingKey;
  days: string;
  interval: string;
  maxDaily: string;
  general: GeneralKey[];
  notes: Tr[];
}

export interface ScriptBlock {
  label: string;
  lines: string[];
}
