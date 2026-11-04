'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { findAdmin, requireAdmin } from '@/lib/admin-auth';
import { AdminError, saveReport, setReportHidden } from '@/lib/admin-reports';
import { STATUS_LABEL, type AdminFormState, type ReportStatus } from '@/lib/report-meta';
import { isOverLimit } from '@/lib/reports';
import { createClient } from '@/lib/supabase/server';

const SERVER_ERROR = '요청을 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
const LOGIN_FAILED = '이메일 또는 비밀번호가 올바르지 않습니다.';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (form: FormData, name: string) => String(form.get(name) ?? '').replace(/\u0000/g, '').trim();

function refresh(id: string) {
  revalidatePath('/admin');
  revalidatePath(`/admin/reports/${id}`);
  revalidatePath('/reports');
}

export async function adminSignIn(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  const supabase = await createClient();
  try {
    if (await isOverLimit('admin-login', ip, 10, 15)) return { error: '시도가 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: text(form, 'email'),
      password: String(form.get('password') ?? '')
    });
    if (error || !data.user) return { error: error?.code === 'invalid_credentials' ? LOGIN_FAILED : SERVER_ERROR };
    // 관리자 목록에 없는 계정은 세션을 남기지 않고, 계정 존재 여부도 알리지 않음
    if (!(await findAdmin(data.user.id))) {
      await supabase.auth.signOut();
      return { error: LOGIN_FAILED };
    }
  } catch (e) {
    console.error('관리자 로그인 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
  redirect('/admin');
}

export async function adminSignOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function saveReportAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const id = text(form, 'id');
  const complete = form.get('complete') === '1';
  const status = (complete ? 'resolved' : text(form, 'status')) as ReportStatus;
  const reply = text(form, 'reply');
  if (!UUID.test(id)) return { error: '신고를 찾을 수 없습니다.' };
  if (!Object.hasOwn(STATUS_LABEL, status)) return { error: '처리 상태를 선택해 주세요.' };
  if (reply.length > 2000) return { error: '답변은 2000자 이내로 입력해 주세요.' };
  try {
    const changed = await saveReport(id, admin, status, reply || null);
    if (!changed) return { notice: '바뀐 내용이 없습니다.' };
  } catch (e) {
    if (e instanceof AdminError) return { error: e.message };
    console.error('신고 처리 저장 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
  refresh(id);
  return { notice: complete ? '처리 완료로 저장했습니다.' : '저장했습니다.' };
}

export async function hideReportAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const id = text(form, 'id');
  const reason = text(form, 'reason');
  if (!UUID.test(id)) return { error: '신고를 찾을 수 없습니다.' };
  if (!reason || reason.length > 300) return { error: '숨기는 이유를 300자 이내로 입력해 주세요.' };
  try {
    await setReportHidden(id, admin, reason);
  } catch (e) {
    if (e instanceof AdminError) return { error: e.message };
    console.error('신고 숨김 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
  refresh(id);
  return {};
}

export async function unhideReportAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const id = text(form, 'id');
  if (!UUID.test(id)) return { error: '신고를 찾을 수 없습니다.' };
  try {
    await setReportHidden(id, admin, null);
  } catch (e) {
    if (e instanceof AdminError) return { error: e.message };
    console.error('신고 숨김 해제 실패', (e as Error).message);
    return { error: SERVER_ERROR };
  }
  refresh(id);
  return {};
}
