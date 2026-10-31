import { TIMINGS } from '@/data/rx-data';
import { findDrug } from '@/lib/search';
import { cautions, fmtNum, freqText, itemTitle, qtyText, timingText } from '@/lib/sentences';
import type { Item, Lang, ScriptBlock, TimingKey, UnitKey } from '@/lib/types';

/* 구어체 복약지도 스크립트 */
const KO_NATIVE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const ORD = {
  ko: ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'],
  en: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'],
  zh: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
};
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// 한국어 구어: "한 알", "두 포", "반 알"
function koSpokenQty(q: number, unitKey: UnitKey): string {
  if (unitKey === 'ml') return `${fmtNum(q)}mL`;
  const word = { tab: '알', cap: '캡슐', pkt: '포', drop: '방울' }[unitKey];
  if (q === 0.5) return `반 ${word}`;
  if (Number.isInteger(q) && q <= 10) return `${KO_NATIVE[q]} ${word}`;
  return `${fmtNum(q)}${word}`;
}

function spokenFreq(n: number, lang: Lang): string {
  if (lang === 'ko') return `하루 ${KO_NATIVE[n] || n} 번`;
  if (lang === 'zh') return `一天${n}次`;
  if (lang === 'ja') return `1日${n}回`;
  return freqText(n, 'en');
}

type Fn<A extends unknown[]> = Record<Lang, (...a: A) => string>;

const SP = {
  open: {
    ko: (oral) => `안녕하세요. 약 ${oral ? '드시는' : '사용하시는'} 방법을 설명해 드릴게요.`,
    en: (oral) => `Hello. Let me explain how to ${oral ? 'take' : 'use'} your medicine.`,
    zh: (oral) => `您好，我来跟您说明一下这些药怎么${oral ? '吃' : '用'}。`,
    ja: (oral) => `こんにちは。お薬の${oral ? '飲み方' : '使い方'}をご説明しますね。`
  } as Fn<[boolean]>,
  count: {
    ko: (n) => `오늘 드리는 약은 모두 ${n}가지입니다.`,
    en: (n) => `You have ${n} medicines today.`,
    zh: (n) => `今天一共有${n}种药。`,
    ja: (n) => `今日のお薬は全部で${n}種類です。`
  } as Fn<[number]>,
  intro: {
    ko: (i, n, name) => (n === 1 ? `이 약은 ${name}입니다.` : `${ORD.ko[i] || i + 1} 번째 약은 ${name}입니다.`),
    en: (i, n, name) => (n === 1 ? `This medicine is ${name}.` : `The ${ORD.en[i] || `number ${i + 1}`} medicine is ${name}.`),
    zh: (i, n, name) => (n === 1 ? `这个药是${name}。` : `第${ORD.zh[i] || i + 1}种药是${name}。`),
    ja: (i, n, name) => (n === 1 ? `こちらのお薬は${name}です。` : `${i < 9 ? `${i + 1}つ目` : `${i + 1}番目`}のお薬は${name}です。`)
  } as Fn<[number, number, string]>,
  purpose: {
    ko: (u) => `${u}에 쓰는 약이에요.`,
    en: (u) => `It's for ${lcFirst(u)}.`,
    zh: (u) => `主要用于${u}。`,
    ja: (u) => `${u}のお薬です。`
  } as Fn<[string]>,
  oral: {
    ko: (f, q, tk) => `${f}, 한 번에 ${q}씩 ${TIMINGS[tk].ko} 드세요.`,
    en: (f, q, tk, n) => `Please take ${q} ${f}, ${timingText(tk, n, 'en')}.`,
    zh: (f, q, tk) => (tk === 'anytime' ? `${f}，每次${q}，什么时间吃都可以。` : `${f}，每次${q}，${TIMINGS[tk].zh}吃。`),
    ja: (f, q, tk) => `${f}、1回${q}ずつ、${TIMINGS[tk].ja}飲んでください。`
  } as Fn<[string, string, TimingKey, number]>,
  oralPrn: {
    ko: (q) => `증상이 있을 때만 한 번에 ${q}씩 드세요.`,
    en: (q) => `Please take ${q} only when you have symptoms.`,
    zh: (q) => `有症状的时候再吃，每次${q}。`,
    ja: (q) => `症状がある時だけ、1回${q}飲んでください。`
  } as Fn<[string]>,
  eye: {
    ko: (f, q) => `${f}, 한 번에 ${q}씩 눈에 넣어 주세요.`,
    en: (f, q) => `Please put ${q} in your eye(s) ${f}.`,
    zh: (f, q) => `${f}，每次${q}，滴在眼睛里。`,
    ja: (f, q) => `${f}、1回${q}ずつ点眼してください。`
  } as Fn<[string, string]>,
  eyePrn: {
    ko: (q) => `필요할 때 한 번에 ${q}씩 눈에 넣어 주세요.`,
    en: (q) => `Please put ${q} in your eye(s) whenever you need to.`,
    zh: (q) => `需要的时候滴，每次${q}。`,
    ja: (q) => `必要な時に1回${q}ずつ点眼してください。`
  } as Fn<[string]>,
  topical: {
    ko: (f) => `${f}, 아픈 부위에 얇게 발라 주세요.`,
    en: (f) => `Please apply a thin layer to the affected area ${f}.`,
    zh: (f) => `${f}，在患处薄薄地涂一层。`,
    ja: (f) => `${f}、患部に薄く塗ってください。`
  } as Fn<[string]>,
  topicalPrn: {
    ko: () => '필요할 때 아픈 부위에 얇게 발라 주세요.',
    en: () => 'Please apply a thin layer to the affected area whenever you need to.',
    zh: () => '需要的时候在患处薄薄地涂一层。',
    ja: () => '必要な時に患部に薄く塗ってください。'
  } as Fn<[]>,
  interval: {
    ko: (h) => `한 번 드시면 다음 복용까지 최소 ${h}시간은 간격을 두세요.`,
    en: (h) => `Wait at least ${h} hours before taking another dose.`,
    zh: (h) => `两次之间至少要隔${h}个小时。`,
    ja: (h) => `次に飲むまで${h}時間以上あけてください。`
  } as Fn<[number]>,
  max: {
    ko: (m, oral) => `하루에 ${KO_NATIVE[m] || m} 번까지만 ${oral ? '드세요' : '사용하세요'}.`,
    en: (m, oral) => `Please ${oral ? 'take' : 'use'} it no more than ${m === 1 ? 'once' : `${m} times`} a day.`,
    zh: (m, oral) => `一天最多${oral ? '吃' : '用'}${m}次。`,
    ja: (m) => `1日${m}回までにしてください。`
  } as Fn<[number, boolean]>,
  supply: {
    ko: (d) => `${d}일분 드렸어요.`,
    en: (d) => `I've given you enough for ${d} ${d > 1 ? 'days' : 'day'}.`,
    zh: (d) => `这里是${d}天的量。`,
    ja: (d) => `${d}日分お出ししています。`
  } as Fn<[number]>,
  useFor: {
    ko: (d) => `${d}일 동안 사용하세요.`,
    en: (d) => `Please use it for ${d} ${d > 1 ? 'days' : 'day'}.`,
    zh: (d) => `请连续用${d}天。`,
    ja: (d) => `${d}日間使ってください。`
  } as Fn<[number]>,
  cautionIntro: {
    ko: '그리고 주의하실 점이 있어요.',
    en: 'Also, please keep these points in mind.',
    zh: '另外，有几点需要注意。',
    ja: 'それから、注意していただきたいことがあります。'
  } as Record<Lang, string>,
  close: {
    ko: ['궁금한 점 있으시면 편하게 물어보세요.', '몸조리 잘 하시고, 빨리 나으세요.'],
    en: ['If you have any questions, feel free to ask me.', 'Take care, and I hope you feel better soon.'],
    zh: ['如果有什么不清楚的，请随时问我。', '请多保重，祝您早日康复！'],
    ja: ['ご不明な点があれば、お気軽にお尋ねください。', 'どうぞお大事になさってください。']
  } as Record<Lang, string[]>
};

function spokenDirections(it: Item, lang: Lang): string[] {
  const out: string[] = [];
  const prn = it.freq === 'prn';
  const n = prn ? 0 : Number(it.freq);
  const q = lang === 'ko' ? koSpokenQty(it.qty, it.unit) : qtyText(it.qty, it.unit, lang);
  const f = prn ? '' : spokenFreq(n, lang);

  if (it.route === 'oral') {
    if (prn) {
      out.push(SP.oralPrn[lang](q));
      if (it.interval) out.push(SP.interval[lang](it.interval));
    } else {
      out.push(SP.oral[lang](f, q, it.timing, n));
    }
  } else if (it.route === 'eye') {
    out.push(prn ? SP.eyePrn[lang](q) : SP.eye[lang](f, q));
  } else {
    out.push(prn ? SP.topicalPrn[lang]() : SP.topical[lang](f));
  }
  if (prn && it.max) out.push(SP.max[lang](it.max, it.route === 'oral'));
  if (it.days) out.push(it.route === 'oral' ? SP.supply[lang](it.days) : SP.useFor[lang](it.days));
  return out;
}

// 블록 단위 스크립트: [{ label, lines: [문장] }]
export function buildScript(list: Item[], lang: Lang): ScriptBlock[] {
  const total = list.length;
  const allOral = list.every((it) => it.route === 'oral');
  const blocks: ScriptBlock[] = [];

  const opening = [SP.open[lang](allOral)];
  if (total > 1) opening.push(SP.count[lang](total));
  blocks.push({ label: '시작 인사', lines: opening });

  list.forEach((it, i) => {
    const d = findDrug(it.drugId);
    const name = d ? d.ing[lang] : it.customName;
    const lines = [SP.intro[lang](i, total, name)];
    if (d) lines.push(SP.purpose[lang](d.use[lang]));
    lines.push(...spokenDirections(it, lang));
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
