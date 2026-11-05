/* =========================================================
 * 영문 복약지도 가이드 - 데이터 (약품 정보는 식약처 API에서 검색)
 *  - UNITS   : 용량 단위
 *  - TIMINGS : 복용 시점
 *  - GENERAL : 공통 주의사항 (체크박스로 선택)
 *  - UI      : 출력 화면 문구
 * ========================================================= */

import type { GeneralKey, Timing, TimingKey, Tr, UiKey, Unit, UnitKey } from '@/lib/types';

/* 용량 단위 */
export const UNITS: Record<UnitKey, Unit> = {
  tab:  { label: '정',   ko: '정',   en: ['tablet', 'tablets'],
          half: { ko: '반 정', en: 'half a tablet' } },
  cap:  { label: '캡슐', ko: '캡슐', en: ['capsule', 'capsules'] },
  pkt:  { label: '포',   ko: '포',   en: ['packet', 'packets'] },
  ml:   { label: 'mL',   ko: 'mL',   en: ['mL', 'mL'] },
  mg:   { label: 'mg',   ko: 'mg',   en: ['mg', 'mg'] },
  drop: { label: '방울', ko: '방울', en: ['drop', 'drops'] },
  supp: { label: '좌제', ko: '개',   en: ['suppository', 'suppositories'] },
  enema: { label: '관장약', ko: '개', en: ['enema', 'enemas'] }
};

/* 복용 시점 (ko는 조사를 포함, en1은 1일 1회일 때 사용) */
export const TIMINGS: Record<TimingKey, Timing> = {
  after_30:  { label: '식후 30분',         ko: '식후 30분에',        en: '30 minutes after meals',  en1: '30 minutes after a meal' },
  after_now: { label: '식후 즉시',         ko: '식후 즉시',          en: 'right after meals',       en1: 'right after a meal' },
  after_2h:  { label: '식후 2시간',        ko: '식후 2시간에',       en: '2 hours after meals',     en1: '2 hours after a meal' },
  with_meal: { label: '식사와 함께',       ko: '식사와 함께',        en: 'with meals',              en1: 'with a meal' },
  before_30: { label: '식전 30분',         ko: '식전 30분에',        en: '30 minutes before meals', en1: '30 minutes before a meal' },
  before_1h: { label: '식전 1시간',        ko: '식전 1시간에',       en: '1 hour before meals',     en1: '1 hour before a meal' },
  bedtime:   { label: '취침 전',           ko: '취침 전에',          en: 'at bedtime' },
  after_bed: { label: '식후 및 취침 전',   ko: '식후 및 취침 전에',  en: 'after meals and at bedtime' },
  empty:     { label: '공복',              ko: '공복에',             en: 'on an empty stomach' },
  q6h:       { label: '6시간마다',         ko: '6시간마다',          en: 'every 6 hours' },
  q8h:       { label: '8시간마다',         ko: '8시간마다',          en: 'every 8 hours' },
  q12h:      { label: '12시간마다',        ko: '12시간마다',         en: 'every 12 hours' },
  // 항암제·항호르몬제 등
  same_time: { label: '24시간마다 (매일 같은 시간)', ko: '매일 같은 시간에(24시간마다)', en: 'at the same time every day (every 24 hours)' }
};

/* 공통 주의사항 */
export const GENERAL: Record<GeneralKey, Tr> = {
  drowsy: {
    ko: '졸음이 올 수 있으니 운전이나 기계 조작을 피하세요.',
    en: 'May cause drowsiness. Do not drive or operate machinery.'
  },
  no_alcohol: {
    ko: '복용 중에는 술을 마시지 마세요.',
    en: 'Avoid alcohol while taking this medicine.'
  },
  complete: {
    ko: '증상이 좋아져도 처방된 기간 동안 끝까지 복용하세요.',
    en: 'Finish the full course, even if you feel better.'
  },
  missed: {
    ko: '복용을 잊었다면 생각난 즉시 복용하되, 다음 복용 시간이 가까우면 건너뛰세요. 한 번에 2회분을 복용하지 마세요.',
    en: 'If you miss a dose, take it as soon as you remember. If it is almost time for the next dose, skip the missed dose. Never take a double dose.'
  },
  water: {
    ko: '물을 충분히 드세요.',
    en: 'Drink plenty of water.'
  },
  swallow: {
    ko: '씹거나 부수지 말고 그대로 삼키세요.',
    en: 'Swallow whole. Do not crush or chew.'
  },
  stop_rash: {
    ko: '발진, 가려움, 호흡곤란 등이 나타나면 복용을 중단하고 의사·약사와 상담하세요.',
    en: 'Stop taking and contact a doctor or pharmacist if you get a rash, itching, or difficulty breathing.'
  },
  consult: {
    ko: '3일 이상 복용해도 증상이 나아지지 않으면 병원 진료를 받으세요.',
    en: 'If your symptoms do not improve after 3 days, see a doctor.'
  },
  shake: {
    ko: '사용 전에 잘 흔드세요.',
    en: 'Shake well before use.'
  },
  fridge: {
    ko: '냉장(2~8℃) 보관하세요.',
    en: 'Store in the refrigerator (2–8°C).'
  },
  room: {
    ko: '직사광선과 습기를 피해 실온에 보관하세요.',
    en: 'Store at room temperature, away from direct sunlight and moisture.'
  },
  child: {
    ko: '어린이의 손이 닿지 않는 곳에 보관하세요.',
    en: 'Keep out of reach of children.'
  }
};

/* 출력 화면 문구 */
export const UI: Record<UiKey, Tr> = {
  title:    { ko: '복약 안내',  en: 'Medication Guide' },
  pharmacy: { ko: '약국',       en: 'Pharmacy' },
  purpose:  { ko: '효능',       en: 'Used for' },
  howto:    { ko: '용법',       en: 'How to use' },
  sideEffects: { ko: '부작용',  en: 'Side effects' },
  caution:  { ko: '주의사항',   en: 'Precautions' },
  product:  { ko: '제품명',     en: 'Product' },
  footer: {
    ko: '궁금한 점이 있으면 약사에게 문의하세요.',
    en: 'If you have any questions, please ask the pharmacist.'
  }
};
