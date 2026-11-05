/* =========================================================
 * 환자 설명 자동 작성 (서버 전용)
 *  1) 식약처 허가사항 효능효과·이상반응 원문 (+ e약은요 효능·부작용) 수집
 *  2) Gemini로 환자에게 말할 짧은 한국어 설명 작성 — 원문에 있는 내용만
 *  3) 한국어 → 영어 일괄 번역 + 역번역
 *  결과는 약사가 화면에서 검토·수정하는 초안이다.
 * ========================================================= */
import { getDetail } from '@/lib/mfds';
import { generate, translateBatch } from '@/lib/translate';

export interface InfoLine {
  ko: string;
  en: string;
  back: string; // 영어를 다시 한국어로 (확인용)
}
export interface InfoResult {
  purpose: InfoLine | null;
  sideEffects: InfoLine[];
  serious: InfoLine | null;
  source: string; // 근거로 쓴 원문 종류
}

const SUMMARY_SYSTEM = `You help a Korean community pharmacist explain a medicine to a patient.
You get official Korean drug label text (efficacy and adverse reactions).
Write short, plain KOREAN sentences the pharmacist can say to the patient (polite spoken style, ~요 ending).
Rules:
- Use ONLY information in the given text. Do not add anything from general knowledge. If something is not in the text, return an empty string / empty list.
- purpose: ONE sentence about what the medicine is used for, in everyday words (e.g. "유방암 치료에 쓰는 약이에요.").
- sideEffects: the 3 to 5 MOST COMMON side effects a patient may notice, one short sentence each, everyday words
  (e.g. "메스꺼움이나 구토가 있을 수 있어요."). Prefer items described as common/frequent. Skip lab-test-only findings.
- serious: ONE sentence telling when to contact a doctor right away, based on the serious reactions in the text. Empty if the text has none.
  If the text says to stop the medicine, the sentence MUST say so (e.g. "숨이 차거나 열이 나면 약을 멈추고 바로 병원에 연락하세요.").
  If the text does not say to stop, do not add it (e.g. "숨이 차거나 열이 나면 바로 병원에 연락하세요.").
- Describe what the PATIENT WOULD FEEL OR SEE, not disease names
  (e.g. "숨이 많이 차요" instead of "급성 호흡곤란 증후군", "피부나 눈이 노래져요" instead of "간독성").
- No drug names, no percentages, no medical jargon if a plain word exists.
Return only the JSON described by the schema.`;

const SUMMARY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    purpose: { type: 'STRING' },
    sideEffects: { type: 'ARRAY', items: { type: 'STRING' } },
    serious: { type: 'STRING' }
  },
  required: ['purpose', 'sideEffects', 'serious']
};

const cache = new Map<string, InfoResult>();

export async function buildPatientInfo(itemSeq: string, extra: { efcy?: string; se?: string } = {}): Promise<InfoResult> {
  // 보충 문장에 따라 결과가 달라지므로 함께 키로 사용
  const key = [itemSeq, extra.efcy ?? '', extra.se ?? ''].join('\u0000');
  const hit = cache.get(key);
  if (hit) return hit;

  const det = await getDetail(itemSeq);
  // 허가사항 원문 우선, e약은요(일반의약품) 문장은 보충
  const efficacy = [det.ee, extra.efcy].filter(Boolean).join('\n').slice(0, 3000);
  const adverse = [det.se, extra.se].filter(Boolean).join('\n').slice(0, 9000);
  if (!efficacy && !adverse) throw new Error('식약처 자료에 효능·부작용 정보가 없습니다. 직접 입력해 주세요.');

  const sum = await generate<{ purpose?: string; sideEffects?: string[]; serious?: string }>(
    SUMMARY_SYSTEM,
    `[효능효과]\n${efficacy || '(없음)'}\n\n[이상반응]\n${adverse || '(없음)'}`,
    SUMMARY_SCHEMA
  );
  const purpose = (sum.purpose ?? '').trim();
  const sideEffects = (sum.sideEffects ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const serious = (sum.serious ?? '').trim();

  // 한국어 문장들을 한 번에 번역 (순서: 효능, 부작용들, 병원)
  const ko = [purpose, ...sideEffects, serious].filter(Boolean);
  const tr = await translateBatch(ko);
  let k = 0;
  const line = (s: string): InfoLine | null => (s ? { ko: s, ...tr[k++] } : null);

  const result: InfoResult = {
    purpose: line(purpose),
    sideEffects: sideEffects.map((s) => line(s)!),
    serious: line(serious),
    source: [det.ee && '허가사항 효능효과', det.se && '허가사항 이상반응', extra.efcy && 'e약은요'].filter(Boolean).join(' · ')
  };
  // 역번역을 못 받은 문장이 있으면 저장하지 않음 → 다음 호출에서 다시 받아 약사가 확인할 수 있게
  if ([result.purpose, ...result.sideEffects, result.serious].every((l) => !l || l.back)) cache.set(key, result);
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  return result;
}
