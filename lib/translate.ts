/* =========================================================
 * 한국어 → 영어 번역 (Gemini API, 서버 전용 — 클라이언트에서 import 금지)
 *  - 약사가 한국어로 직접 입력한 문구를 환자용 영어 안내문에 맞게 번역
 *  - 항목(kind)마다 영어 문장 안에 들어갈 자리에 맞는 형태로 요청
 *  - 역번역(back)을 함께 받아 약사가 한국어로 뜻을 확인할 수 있게 함
 * ========================================================= */

export type TranslateKind = 'route' | 'unit' | 'freq' | 'timing' | 'cycle' | 'note' | 'name' | 'pharmacy';

export interface TranslateResult {
  en: string; // unit은 "단수|복수", route는 "{dose}" 자리표시 포함
  back: string; // 영어를 다시 한국어로 옮긴 문장 (확인용)
}

const API = 'https://generativelanguage.googleapis.com/v1beta/models';
// 짧은 문구 번역이라 가벼운 모델로 충분. 응답 속도는 시간대에 따라 크게 달라짐. GEMINI_MODEL로 변경 가능
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

const SYSTEM = `You are a translator for a Korean community pharmacy.
A Korean pharmacist types short instructions in Korean; you turn them into plain, patient-friendly English
that will be printed on a medication guide for a foreign patient.
Rules:
- Keep the medical meaning exactly. Do not add, remove, or soften any information. Keep all numbers and units.
  Do not add qualifiers that are not in the Korean (such as "at least", "about", "if needed").
- If the input is unreadable, garbled, or you are not sure what it means, return an empty string for "en". Never guess or invent an instruction.
- Use simple everyday English (about 6th-grade reading level). No Korean characters in the English.
- Return only the JSON described by the schema.`;

// 역번역은 원문 한국어를 보여주지 않은 별도 호출로 받음 → 영어가 틀렸으면 역번역도 달라져 약사가 알아챌 수 있음
const BACK_SYSTEM = `You translate English patient instructions from a pharmacy into natural Korean.
Translate exactly what the English says — do not fix, guess, or improve the meaning.
Return only the JSON described by the schema.`;

// 항목별 지시: 영어 안내문 문장 안 어느 자리에 들어가는지 알려 줌
const KIND_PROMPT: Record<TranslateKind, string> = {
  route:
    'How the medicine is used (e.g. "흡입하세요", "질에 넣으세요", "혀 밑에 녹이세요"). ' +
    'Return an imperative verb phrase where the dose goes at {dose}, e.g. "Inhale {dose}", "Insert {dose} into the vagina", ' +
    '"Dissolve {dose} under the tongue". It will be followed by a frequency like "twice a day".',
  unit:
    'A dosage unit (e.g. "흡입", "좌제", "패치", "앰플"). Return the English countable noun as "singular|plural", ' +
    'e.g. "puff|puffs", "suppository|suppositories", "patch|patches".',
  freq:
    'How often to use the medicine. It completes "Take 1 tablet ___" — return only that phrase, ' +
    'e.g. "3 to 4 times a day", "every morning and evening", "several times", "repeatedly". ' +
    'It is a frequency only. If the Korean is not about how often (for example it describes HOW to apply or use the medicine), return an empty string.',
  timing:
    'When to use the medicine. It completes "Take 1 tablet once a day, ___." — return only that phrase without a period, ' +
    'e.g. "after brushing your teeth", "1 hour before breakfast".',
  cycle: 'A schedule instruction. Return one or two complete English sentences ending with a period.',
  note: 'A caution or advice for the patient. Return one or two complete English sentences ending with a period.',
  name:
    'A Korean medicine PRODUCT name (brand name + dosage form + strength). Return the English PRODUCT name: ' +
    'romanize/transliterate the brand part as the product is known, translate the dosage form, keep the strength. ' +
    'NEVER replace the brand with the active ingredient (generic) name. ' +
    'e.g. "버제니오정200밀리그램" → "Verzenio Tablet 200 mg", "판콜에이내복액" → "Pancold-A Oral Solution", "세파클러캡슐 250mg" → "Cefaclor Capsule 250 mg".',
  pharmacy: 'A pharmacy name. Romanize the proper name and translate "약국" as "Pharmacy", e.g. "행복약국" → "Haengbok Pharmacy".'
};

const SCHEMA = { type: 'OBJECT', properties: { en: { type: 'STRING' } }, required: ['en'] };
const BACK_SCHEMA = { type: 'OBJECT', properties: { ko: { type: 'STRING' } }, required: ['ko'] };

const cache = new Map<string, TranslateResult>();

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY?.trim();
  if (!k) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. (로컬: .env.local / Vercel: Settings → Environment Variables 추가 후 재배포)');
  }
  return k;
}

/** 결과 정리: 따옴표·줄바꿈 제거, 항목별 형식 보정 */
function normalize(kind: TranslateKind, en: string): string {
  let s = en.replace(/\s+/g, ' ').replace(/^["'“”]+|["'“”]+$/g, '').trim();
  if (kind === 'timing' || kind === 'freq') s = s.replace(/[.。]$/, '');
  if (kind === 'unit' && !s.includes('|')) s = `${s}|${s}`;
  if (kind === 'route' && !s.includes('{dose}')) s = `${s} {dose}`;
  return s;
}

export class QuotaError extends Error {}

/** Gemini 한 번 호출 → JSON 결과 */
export async function generate<T>(system: string, prompt: string, schema: object): Promise<T> {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: schema }
    })
  });
  const body = await res.text();
  if (res.status === 429) {
    throw new QuotaError('Gemini 사용량 한도를 넘었습니다(무료 등급은 분당 요청 수가 적음). 잠시 뒤 다시 시도하거나 AI Studio에서 결제 설정을 확인하세요.');
  }
  if (!res.ok) {
    let msg = body.slice(0, 200);
    try { msg = JSON.parse(body).error?.message ?? msg; } catch { /* 그대로 */ }
    throw new Error(`Gemini ${res.status}: ${msg}`);
  }
  const json = JSON.parse(body) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('번역 결과를 읽지 못했습니다.');
  }
}

/** 역번역용 영어: 자리표시·단수형을 사람이 읽는 형태로 */
const backSource = (kind: TranslateKind, en: string) =>
  kind === 'unit' ? en.split('|').map((w, i) => `${i + 1} ${w}`).join(', ') : kind === 'route' ? en.replace('{dose}', '(the dose)') : en;

const backCache = new Map<string, string>();

/** 영어 → 한국어 역번역만 (화면은 영어를 먼저 보여 주고 이 결과는 뒤따라 붙임) */
export async function backTranslate(kind: TranslateKind, en: string): Promise<string> {
  const key = `${kind}\u0000${en}`;
  const hit = backCache.get(key);
  if (hit != null) return hit;
  const b = await generate<{ ko?: string }>(BACK_SYSTEM, `English:\n${backSource(kind, en)}`, BACK_SCHEMA);
  const back = (b.ko ?? '').trim();
  backCache.set(key, back);
  if (backCache.size > 2000) backCache.delete(backCache.keys().next().value!);
  return back;
}

/** withBack=false면 영어만 먼저 돌려줌 (역번역은 backTranslate로 따로) */
export async function translateKo(kind: TranslateKind, ko: string, withBack = true): Promise<TranslateResult> {
  const text = ko.trim();
  const key = `${kind}\u0000${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // 1) 한국어 → 영어 (항목별 형식 지시 포함)
  const out = await generate<{ en?: string }>(SYSTEM, `Field: ${kind}\n${KIND_PROMPT[kind]}\n\nKorean input:\n${text}`, SCHEMA);
  if (!out.en?.trim()) {
    throw new Error(
      kind === 'freq'
        ? '횟수 표현으로 번역할 수 없습니다. 이 칸에는 "하루 3~4번", "여러 번 반복하여"처럼 횟수만 쓰고, 사용 방법 설명은 아래 "+ 직접 입력"(주의사항)에 쓰세요.'
        : kind === 'note'
          ? '끝맺지 않은 문구라 번역할 수 없습니다. 문장을 끝까지 써 주세요. (예: "면봉에 적셔서 바르세요.")'
          : '입력한 내용을 이해하지 못했습니다. 문장을 조금 더 분명하게 써 주세요.'
    );
  }
  const en = normalize(kind, out.en);

  if (!withBack) return { en, back: '' };

  // 2) 영어 → 한국어 (원문을 모르는 상태에서 역번역, 실패해도 번역 자체는 사용)
  let back = '';
  try {
    back = await backTranslate(kind, en);
  } catch { /* 역번역 실패는 무시 */ }

  const result = { en, back };
  cache.set(key, result);
  if (cache.size > 2000) cache.delete(cache.keys().next().value!);
  return result;
}

const LIST_SCHEMA = { type: 'OBJECT', properties: { items: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['items'] };

/**
 * 한국어 문장 여러 개를 한 번에 번역 (환자 설명처럼 문장이 여러 개일 때 호출 수를 줄이려고)
 *  - 번역 1회 + 역번역 1회 (역번역은 원문 한국어를 보여주지 않음)
 */
export async function translateBatch(sentences: string[]): Promise<TranslateResult[]> {
  const src = sentences.map((s) => s.trim());
  if (!src.length) return [];
  const numbered = src.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const out = await generate<{ items?: string[] }>(
    SYSTEM,
    `Field: note\n${KIND_PROMPT.note}\nTranslate each numbered Korean sentence. Return "items" with exactly ${src.length} English strings in the same order (no numbers).\n\nKorean input:\n${numbered}`,
    LIST_SCHEMA
  );
  const en = out.items ?? [];
  if (en.length !== src.length || en.some((e) => !e?.trim())) throw new Error('일부 문장을 번역하지 못했습니다.');

  let back: string[] = [];
  try {
    const b = await generate<{ items?: string[] }>(
      BACK_SYSTEM,
      `Translate each numbered English sentence into Korean. Return "items" with exactly ${en.length} Korean strings in the same order.\n\nEnglish:\n${en.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
      LIST_SCHEMA
    );
    back = b.items?.length === en.length ? b.items : [];
  } catch { /* 역번역 실패는 무시 (화면에서 "확인용 번역 없음" 표시) */ }

  return en.map((e, i) => ({ en: normalize('note', e), back: (back[i] ?? '').trim() }));
}
