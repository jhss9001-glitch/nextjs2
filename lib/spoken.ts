import { pillSentence } from '@/lib/pill';
import {
  cautions, durationOf, enTail, fmtNum, freqOf, infoOf, itemName, itemTitle, koHead, NO_DOSE_EN, pillOf, qtyOf, routePhrase, routeVerbKo, tidy,
  timingOf, tx
} from '@/lib/sentences';
import { isInsertRoute, type Item, type Lang, type ScriptBlock } from '@/lib/types';

/* 구어체 복약지도 스크립트 */
const KO_NATIVE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const ORD = {
  ko: ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'],
  en: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']
};
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// 한국어 구어: "한 알", "두 포", "반 알" (직접 입력한 단위는 숫자 그대로)
function koSpokenQty(it: Item): string {
  const q = it.qty;
  if (it.unit === 'none') return '';
  if (it.unit === 'custom') return `${fmtNum(q)}${tx(it.texts.unit, 'ko')}`;
  if (it.unit === 'ml') return `${fmtNum(q)}mL`;
  if (it.unit === 'mg') return `${fmtNum(q)}mg`;
  const word = { tab: '알', cap: '캡슐', pkt: '포', drop: '방울', supp: '개', enema: '개' }[it.unit];
  if (q === 0.5) return `반 ${word}`;
  if (Number.isInteger(q) && q <= 10) return `${KO_NATIVE[q]} ${word}`;
  return `${fmtNum(q)}${word}`;
}

function spokenFreq(it: Item, lang: Lang): string {
  if (lang === 'en' || it.freq === 'custom' || it.freq === 'none') return freqOf(it, lang);
  const n = Number(it.freq);
  if (it.cycle === 'weekly') return '일주일에 한 번';
  if (it.cycle === 'alt') return n === 1 ? '이틀에 한 번' : `이틀에 한 번, 하루 ${KO_NATIVE[n] || n} 번`;
  return `하루 ${KO_NATIVE[n] || n} 번`;
}

type Fn<A extends unknown[]> = Record<Lang, (...a: A) => string>;

// 용량 '선택 안 함'이면 "한 번에 …씩"을 빼고 말함
const doseKo = (q: string) => (q ? `한 번에 ${q}씩` : '');

const SP = {
  open: {
    ko: (oral) => `안녕하세요. 약 ${oral ? '드시는' : '사용하시는'} 방법을 설명해 드릴게요.`,
    en: (oral) => `Hello. Let me explain how to ${oral ? 'take' : 'use'} your medicine.`
  } as Fn<[boolean]>,
  count: {
    ko: (n) => `오늘 드리는 약은 모두 ${n}가지입니다.`,
    en: (n) => `You have ${n} medicines today.`
  } as Fn<[number]>,
  intro: {
    ko: (i, n, name) => (n === 1 ? `이 약은 ${name}입니다.` : `${ORD.ko[i] || i + 1} 번째 약은 ${name}입니다.`),
    en: (i, n, name) => (n === 1 ? `This medicine is ${name}.` : `The ${ORD.en[i] || `number ${i + 1}`} medicine is ${name}.`)
  } as Fn<[number, number, string]>,
  oral: {
    ko: (f, q, t) => tidy(`${koHead(f, `${doseKo(q)} ${t}`)} 드세요.`),
    en: (f, q, t) => tidy(`Please take ${q || NO_DOSE_EN} ${enTail(f, t)}.`)
  } as Fn<[string, string, string]>,
  // 직접 입력한 사용 경로: ko는 v = "흡입하세요", en은 v = 용량이 들어간 동사구 ("Inhale 2 puffs")
  custom: {
    ko: (v, f, q, t) => tidy(`${koHead(f, `${doseKo(q)} ${t}`)} ${v}`).replace(/([^.!?。])$/, '$1.'),
    en: (v, f, _q, t) => tidy(`Please ${lcFirst(v)} ${enTail(f, t)}.`)
  } as Fn<[string, string, string, string]>,
  customPrn: {
    ko: (v, q) => tidy(`필요할 때만 ${doseKo(q)} ${v}`).replace(/([^.!?。])$/, '$1.'),
    en: (v) => `Please ${lcFirst(v)} only when you need to.`
  } as Fn<[string, string]>,
  oralPrn: {
    ko: (q) => tidy(`증상이 있을 때만 ${doseKo(q)} 드세요.`),
    en: (q) => `Please take ${q || NO_DOSE_EN} only when you have symptoms.`
  } as Fn<[string]>,
  eye: {
    ko: (f, q) => tidy(`${koHead(f, doseKo(q))} 눈에 넣어 주세요.`),
    en: (f, q) => tidy(`Please put ${q || 'the drops'} in your eye(s) ${f}.`)
  } as Fn<[string, string]>,
  eyePrn: {
    ko: (q) => tidy(`필요할 때 ${doseKo(q)} 눈에 넣어 주세요.`),
    en: (q) => `Please put ${q || 'the drops'} in your eye(s) whenever you need to.`
  } as Fn<[string]>,
  topical: {
    ko: (f) => tidy(`${f}, 아픈 부위에 얇게 발라 주세요.`),
    en: (f) => tidy(`Please apply a thin layer to the affected area ${f}.`)
  } as Fn<[string]>,
  topicalPrn: {
    ko: () => '필요할 때 아픈 부위에 얇게 발라 주세요.',
    en: () => 'Please apply a thin layer to the affected area whenever you need to.'
  } as Fn<[]>,
  interval: {
    ko: (h, insert) => (insert ? `한 번 사용하시면 다음 사용까지 최소 ${h}시간은 간격을 두세요.` : `한 번 드시면 다음 복용까지 최소 ${h}시간은 간격을 두세요.`),
    en: (h, insert) => `Wait at least ${h} hours before ${insert ? 'using' : 'taking'} another dose.`
  } as Fn<[number, boolean]>,
  max: {
    ko: (m, oral) => `하루에 ${KO_NATIVE[m] || m} 번까지만 ${oral ? '드세요' : '사용하세요'}.`,
    en: (m, oral) => `Please ${oral ? 'take' : 'use'} it no more than ${m === 1 ? 'once' : `${m} times`} a day.`
  } as Fn<[number, boolean]>,
  supply: {
    ko: (d) => `${d}일분 드렸어요.`,
    en: (d) => `I've given you enough for ${d} ${d > 1 ? 'days' : 'day'}.`
  } as Fn<[number]>,
  useFor: {
    ko: (d) => `${d}일 동안 사용하세요.`,
    en: (d) => `Please use it for ${d} ${d > 1 ? 'days' : 'day'}.`
  } as Fn<[number]>,
  // 직접 입력한 기간: "2~3주간 사용하세요." / "Please use it for 2 to 3 weeks."
  durationLine: {
    ko: (d, oral) => `${d} ${oral ? '드세요' : '사용하세요'}.`,
    en: (d, oral) => `Please ${oral ? 'take' : 'use'} it ${d}.`
  } as Fn<[string, boolean]>,
  sideIntro: {
    ko: (insert) => `이 약을 ${insert ? '사용하시면' : '드시면'} 이런 부작용이 생길 수 있어요.`,
    en: () => 'This medicine may cause some side effects.'
  } as Fn<[boolean]>,
  cautionIntro: {
    ko: '그리고 주의하실 점이 있어요.',
    en: 'Also, please keep these points in mind.'
  } as Record<Lang, string>,
  close: {
    ko: ['궁금한 점 있으시면 편하게 물어보세요.', '몸조리 잘 하시고, 빨리 나으세요.'],
    en: ['If you have any questions, feel free to ask me.', 'Take care, and I hope you feel better soon.']
  } as Record<Lang, string[]>
};

function spokenDirections(it: Item, lang: Lang): string[] {
  const out: string[] = [];
  const prn = it.freq === 'prn';
  const q = lang === 'ko' ? koSpokenQty(it) : qtyOf(it, lang);
  const f = prn ? '' : spokenFreq(it, lang);
  const takeLike = it.route !== 'eye' && it.route !== 'topical';

  if (it.route === 'oral') {
    if (prn) {
      out.push(SP.oralPrn[lang](q));
      if (it.interval) out.push(SP.interval[lang](it.interval, false));
    } else {
      out.push(SP.oral[lang](f, q, timingOf(it, lang)));
    }
  } else if (it.route === 'eye') {
    out.push(prn ? SP.eyePrn[lang](q) : SP.eye[lang](f, q));
  } else if (it.route === 'topical') {
    out.push(prn ? SP.topicalPrn[lang]() : SP.topical[lang](f));
  } else {
    const v = lang === 'en' ? routePhrase(it, q) : routeVerbKo(it);
    if (prn) {
      out.push(SP.customPrn[lang](v, q));
      if (it.interval) out.push(SP.interval[lang](it.interval, isInsertRoute(it.route)));
    } else {
      out.push(SP.custom[lang](v, f, q, timingOf(it, lang)));
    }
  }
  // 직접 입력한 투여 주기 문장은 그대로 읽어 줌 (한국어가 비어 있으면 빈 줄로 맞춤)
  if (!prn && it.cycle === 'custom') out.push(it.texts.cycle[lang]);
  if (prn && it.max) out.push(SP.max[lang](it.max, it.route === 'oral'));
  if (it.days) out.push(takeLike ? SP.supply[lang](it.days) : SP.useFor[lang](it.days));
  else if (it.texts.days.ko) out.push(SP.durationLine[lang](durationOf(it, lang), it.route === 'oral'));
  return out;
}

// 블록 단위 스크립트: [{ label, lines: [문장] }]
// 한국어 병기를 위해 ko/en의 줄 수가 같아야 하므로, 조건은 영어 기준으로 판단한다.
export function buildScript(list: Item[], lang: Lang): ScriptBlock[] {
  const total = list.length;
  const allOral = list.every((it) => it.route === 'oral');
  const blocks: ScriptBlock[] = [];

  const opening = [SP.open[lang](allOral)];
  if (total > 1) opening.push(SP.count[lang](total));
  blocks.push({ label: '시작 인사', lines: opening });

  list.forEach((it, i) => {
    const info = infoOf(it);
    // 순서: 약 이름 → 무슨 약 → 복용법 → 부작용(→ 바로 병원에) → 주의사항
    // "Amoxapen Cap." 처럼 마침표로 끝나는 이름은 문장 끝 마침표와 겹치지 않게
    const lines = [SP.intro[lang](i, total, itemName(it, lang)).replace(/\.\.$/, '.')];
    // 약 모양: "It is a white oval tablet, marked …" (이름만으로 모를 때 실물과 맞춰 보게)
    const pill = pillOf(it);
    if (pill) lines.push(pillSentence(pill, lang));
    if (info.purpose) lines.push(info.purpose[lang]);
    lines.push(...spokenDirections(it, lang));
    if (info.sideEffects.length || info.serious) {
      lines.push(SP.sideIntro[lang](isInsertRoute(it.route)));
      info.sideEffects.forEach((s) => lines.push(s[lang]));
      if (info.serious) lines.push(info.serious[lang]);
    }
    const cs = cautions(it, lang);
    if (cs.length) {
      lines.push(SP.cautionIntro[lang]);
      cs.forEach((c) => lines.push(c.t));
    }
    blocks.push({ label: `${i + 1}. ${itemTitle(it)}`, lines });
  });

  blocks.push({ label: '마무리', lines: SP.close[lang].slice() });
  return blocks;
}
