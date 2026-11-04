'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { CATEGORY_LABEL, DRUG_OPTIONAL, type LookupState, type ReportCategory, type SubmitState } from '@/lib/report-meta';
import { createReport, findMyReports, isOverLimit } from '@/lib/reports';

const SERVER_ERROR = '요청을 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
const TOO_MANY = '시도가 너무 많습니다. 잠시 뒤 다시 시도해 주세요.';
const LOCKED = '비밀번호를 여러 번 틀려 잠겼습니다. 15분 뒤 다시 시도해 주세요.';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').replace(/\u0000/g, '').trim();
// 맥에서 입력한 한글(NFD)도 같은 닉네임으로 인식되게 정규화
const nickname = (form: FormData) => text(form, 'name').normalize('NFC').replace(/\s+/g, ' ');
const password = (form: FormData) => String(form.get('password') ?? '');
const validPassword = (p: string) => /^\d{6,32}$/.test(p);

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export async function submitReport(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const name = nickname(form);
  const pass = password(form);
  const category = text(form, 'category') as ReportCategory;
  const title = text(form, 'title');
  const body = text(form, 'body');
  const itemSeq = text(form, 'itemSeq');
  const drugName = text(form, 'drugName');
  const drugCompany = text(form, 'drugCompany');

  if (!Object.hasOwn(CATEGORY_LABEL, category)) return { error: '분류를 선택해 주세요.' };
  if (!DRUG_OPTIONAL.includes(category) && !itemSeq) return { error: '오류가 있는 약을 검색해서 선택해 주세요.' };
  if (itemSeq && (!/^\d{1,20}$/.test(itemSeq) || !drugName || drugName.length > 200 || drugCompany.length > 200)) {
    return { error: '약을 다시 선택해 주세요.' };
  }
  if (!title || title.length > 100) return { error: '제목을 100자 이내로 입력해 주세요.' };
  if (!body || body.length > 2000) return { error: '내용을 2000자 이내로 입력해 주세요.' };
  if (!name || name.length > 30) return { error: '이름 또는 닉네임을 30자 이내로 입력해 주세요.' };
  if (!validPassword(pass)) return { error: '비밀번호는 숫자 6자리 이상으로 입력해 주세요.' };
  if (pass !== String(form.get('passwordConfirm') ?? '')) return { error: '비밀번호 확인이 일치하지 않습니다.' };

  try {
    if (await isOverLimit('report', await clientIp(), 10, 60)) return { error: TOO_MANY };
    const failure = await createReport(name, pass, {
      category,
      itemSeq: itemSeq || null,
      drugName: drugName || null,
      drugCompany: drugCompany || null,
      title,
      body
    });
    if (failure === 'invalid') return { error: '이미 사용 중인 닉네임이거나 비밀번호가 틀렸습니다.' };
    if (failure === 'locked') return { error: LOCKED };
    if (failure === 'weak') return { error: '123456이나 111111처럼 쉬운 비밀번호는 쓸 수 없습니다.' };
  } catch (e) {
    console.error('오류 신고 저장 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
  revalidatePath('/reports');
  return { done: true };
}

export async function lookUpMyReports(_prev: LookupState, form: FormData): Promise<LookupState> {
  const name = nickname(form);
  const pass = password(form);
  if (!name || !validPassword(pass)) return { error: '닉네임 또는 비밀번호가 올바르지 않습니다.' };

  try {
    if (await isOverLimit('lookup', await clientIp(), 30, 15)) return { error: TOO_MANY };
    const result = await findMyReports(name, pass);
    if (result === 'locked') return { error: LOCKED };
    if (!Array.isArray(result)) return { error: '닉네임 또는 비밀번호가 올바르지 않습니다.' };
    return { reports: result };
  } catch (e) {
    console.error('오류 신고 조회 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
}
