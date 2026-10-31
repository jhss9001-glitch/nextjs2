export type Lang = 'ko' | 'en';
export type Route = 'oral' | 'eye' | 'topical';

export type UnitKey = 'tab' | 'cap' | 'pkt' | 'ml' | 'drop';
export type TimingKey =
  | 'after_30' | 'after_now' | 'after_2h' | 'with_meal' | 'before_30' | 'before_1h'
  | 'bedtime' | 'after_bed' | 'empty' | 'q6h' | 'q8h' | 'q12h' | 'same_time';
export type GeneralKey =
  | 'drowsy' | 'no_alcohol' | 'complete' | 'missed' | 'water' | 'swallow'
  | 'stop_rash' | 'consult' | 'shake' | 'fridge' | 'room' | 'child';
export type UiKey = 'title' | 'pharmacy' | 'purpose' | 'howto' | 'sideEffects' | 'caution' | 'product' | 'footer';

/* 용법 각 항목의 선택값: 목록 값 또는 '직접 입력'(custom) */
export type RouteSel = Route | 'custom';
export type UnitSel = UnitKey | 'custom';
export type TimingSel = TimingKey | 'custom';
/** 투여 주기: 매일('') | 격일 | 주 1회 | 직접 입력 */
export type CycleKey = '' | 'alt' | 'weekly' | 'custom';

export type Tr = Record<Lang, string>;

/** '직접 입력'을 고른 항목의 문구 — 약사는 한국어(ko)만 쓰고, en은 자동 번역 결과 */
export interface CustomTexts {
  route: Tr; // ko "흡입하세요" → en "Inhale {dose}" ({dose} 자리에 용량)
  unit: Tr; // ko "흡입" → en "puff|puffs" (단수|복수)
  freq: Tr; // ko "1일 3~4회" → en "3 to 4 times a day"
  timing: Tr; // ko "양치 후에" → en "after brushing your teeth"
  cycle: Tr; // 투여 주기 문장 (독립된 한 문장)
}

export const emptyTr = (): Tr => ({ en: '', ko: '' });

/**
 * 환자에게 설명할 약 정보 (식약처 효능효과·이상반응을 요약 → 약사가 한국어로 검토·수정, 영어는 자동 번역)
 *  - purpose: 무슨 약인지 한 문장
 *  - sideEffects: 흔한 부작용 (한 문장씩)
 *  - serious: 이럴 땐 바로 병원에 (한 문장)
 */
export interface PatientInfo {
  purpose: Tr;
  sideEffects: Tr[];
  serious: Tr;
}
export const emptyInfo = (): PatientInfo => ({ purpose: emptyTr(), sideEffects: [], serious: emptyTr() });
export const emptyTexts = (): CustomTexts => ({
  route: emptyTr(), unit: emptyTr(), freq: emptyTr(), timing: emptyTr(), cycle: emptyTr()
});

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
  timing?: TimingSel;
  timingText?: Tr; // timing === 'custom'일 때 (식약처 원문의 "식사와 함께" 등)
  days?: number | string | null;
  interval?: number | string | null;
  max?: number | string | null;
  cycle?: CycleKey;
}

/** 식약처 용법 자동 입력 상태 */
export interface DosageState {
  status: 'idle' | 'loading' | 'done' | 'none' | 'error';
  source?: string; // 'e약은요 사용법' | '허가사항 용법용량'
  candidates: DosageCandidate[];
  selected: number; // 적용된 후보 (-1: 없음)
  error?: string;
}

/** 용법용량 문장에서 추정한 자동 입력 후보 */
export interface DosageCandidate {
  text: string; // 근거 문장 (식약처 원문)
  def: DrugDefaults;
  fields: (keyof FormState)[]; // 자동으로 채운 칸
  restHint?: Tr; // "21일 복용 후 7일 휴약" 같은 주기 → 약사가 원하면 직접 입력 주의사항에 추가
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
  ud?: string; // 허가사항 용법용량 원문 (상세 API)
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
  customName: Tr; // 직접 입력한 약 이름 (ko 입력 → en 자동 번역)
  route: RouteSel;
  qty: number;
  unit: UnitSel;
  freq: string; // '1'~'6' | 'prn' | 'custom'
  timing: TimingSel;
  days: number | null;
  interval: number | null;
  max: number | null;
  cycle: CycleKey;
  texts: CustomTexts;
  info: PatientInfo; // 무슨 약인지·부작용
  general: GeneralKey[];
  notes: Tr[]; // 직접 입력한 주의사항 (en 필수, ko 선택)
}

/** 폼 입력값 */
export interface FormState {
  route: RouteSel;
  qty: string;
  unit: UnitSel;
  freq: string;
  timing: TimingSel;
  days: string;
  interval: string;
  maxDaily: string;
  cycle: CycleKey;
  texts: CustomTexts;
  info: PatientInfo;
  general: GeneralKey[];
  notes: Tr[];
}

export interface ScriptBlock {
  label: string;
  lines: string[];
}
