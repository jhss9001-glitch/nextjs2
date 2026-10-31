/* =========================================================
 * 낱알 모양 설명 (식약처 의약품 낱알식별 정보 → 환자용 문구)
 *  - 번역 AI 없이 정해진 대응표로 만듦 (색·모양·제형·각인·분할선)
 *  - 클라이언트·서버 공용 (순수 함수)
 * ========================================================= */
import type { Lang, PillInfo } from '@/lib/types';

const COLORS: Record<string, [string, string]> = {
  하양: ['흰색', 'white'],
  노랑: ['노란색', 'yellow'],
  주황: ['주황색', 'orange'],
  분홍: ['분홍색', 'pink'],
  빨강: ['빨간색', 'red'],
  갈색: ['갈색', 'brown'],
  연두: ['연두색', 'light green'],
  초록: ['초록색', 'green'],
  청록: ['청록색', 'turquoise'],
  파랑: ['파란색', 'blue'],
  남색: ['남색', 'navy blue'],
  자주: ['자주색', 'magenta'],
  보라: ['보라색', 'purple'],
  회색: ['회색', 'gray'],
  검정: ['검은색', 'black'],
  투명: ['투명한', 'clear']
};

const SHAPES: Record<string, string> = {
  원형: 'round',
  타원형: 'oval',
  장방형: 'oblong',
  반원형: 'half-moon',
  삼각형: 'triangular',
  사각형: 'square',
  마름모형: 'diamond-shaped',
  오각형: 'pentagonal',
  육각형: 'hexagonal',
  팔각형: 'octagonal'
};

const FORMS: Record<PillInfo['form'], [string, string]> = {
  tablet: ['정제', 'tablet'],
  capsule: ['캡슐', 'capsule'],
  softcap: ['연질캡슐', 'soft capsule']
};

/** 제형 이름 → 정제/캡슐/연질캡슐 */
export const pillForm = (formName: string): PillInfo['form'] =>
  /연질/.test(formName) ? 'softcap' : /캡슐/.test(formName) ? 'capsule' : 'tablet';

/** 각인 문자: 영문·숫자만 남김 ("마크", "분할선" 같은 설명 글자는 버림) */
export const cleanPrint = (s: unknown): string =>
  String(s ?? '')
    .replace(/[가-힣]+/g, ' ')
    .replace(/[^A-Za-z0-9\-/ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const colorsOf = (p: PillInfo) => p.colors.map((c) => COLORS[c]).filter(Boolean);
const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// 캡슐은 모양(대부분 장방형)을 말하지 않음
const shapeOf = (p: PillInfo) => (p.form === 'tablet' ? p.shape : '');

/** 핵심 표현: "흰색 타원형 정제" / "white oval tablet" (캡슐 두 색은 "white and blue capsule") */
function core(p: PillInfo, lang: Lang): string {
  const cs = colorsOf(p);
  const shape = shapeOf(p);
  if (lang === 'ko') return [cs.map((c) => c[0]).join('·'), shape, FORMS[p.form][0]].filter(Boolean).join(' ');
  return [cs.map((c) => c[1]).join(' and '), shape ? SHAPES[shape] ?? '' : '', FORMS[p.form][1]].filter(Boolean).join(' ');
}

const prints = (p: PillInfo) => [p.front, p.back].filter(Boolean) as string[];

/** 안내문 사진 아래 한 줄: "White oval tablet, marked "TYLENOLER"" / "흰색 타원형 정제 · 각인 TYLENOLER" */
export function pillCaption(p: PillInfo, lang: Lang): string {
  const ps = prints(p);
  if (lang === 'ko') {
    return [core(p, 'ko'), ps.length ? `각인 ${ps.join(' / ')}` : '', p.score ? '분할선' : ''].filter(Boolean).join(' · ');
  }
  let s = capFirst(core(p, 'en'));
  if (ps.length === 1) s += `, marked “${ps[0]}”`;
  if (ps.length === 2) s += `, marked “${ps[0]}” on one side and “${ps[1]}” on the other`;
  if (p.score) s += ', with a score line';
  return s;
}

/** 스크립트에서 읽어 줄 문장: "It is a white oval tablet, marked …" / "흰색 타원형 정제이고, 'TY' 글자가 새겨져 있어요." */
export function pillSentence(p: PillInfo, lang: Lang): string {
  if (lang === 'en') {
    const c = pillCaption(p, 'en');
    const lower = c.charAt(0).toLowerCase() + c.slice(1);
    return `It is ${/^[aeiou]/i.test(lower) ? 'an' : 'a'} ${lower}.`;
  }
  const k = core(p, 'ko');
  const ps = prints(p);
  if (ps.length) return `${k}이고, '${ps.join(' / ')}' 글자가 새겨져 있어요.`;
  // 받침이 있으면 "이에요", 없으면 "예요" (정제예요 / 캡슐이에요)
  const last = k.charCodeAt(k.length - 1);
  const batchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${k}${batchim ? '이에요' : '예요'}.`;
}
