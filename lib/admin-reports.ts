/* =========================================================
 * 관리자용 신고 데이터 (서버 전용)
 *  - 호출 전에 requireAdmin으로 권한을 확인할 것
 *  - 처리 내용은 report_events에 함께 기록한다
 * ========================================================= */
import 'server-only';
import type { Admin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import type { ReportCategory, ReportStatus } from '@/lib/report-meta';
import { PAGE_SIZE } from '@/lib/reports';

export type AdminView = 'open' | 'done' | 'hidden' | 'all';

export interface AdminReportRow {
  id: string;
  nickname: string;
  category: ReportCategory;
  title: string;
  drugName: string | null;
  status: ReportStatus;
  hiddenAt: Date | null;
  createdAt: Date;
}

export interface AdminReport extends AdminReportRow {
  body: string;
  itemSeq: string | null;
  drugCompany: string | null;
  adminReply: string | null;
  hiddenReason: string | null;
  resolvedAt: Date | null;
}

export interface ReportEvent {
  id: string;
  adminName: string;
  action: 'status_changed' | 'replied' | 'hidden' | 'unhidden';
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus | null;
  adminReply: string | null;
  hiddenReason: string | null;
  createdAt: Date;
}

/** 사용자에게 그대로 보여 줘도 되는 실패 */
export class AdminError extends Error {}

const NOT_FOUND = '신고를 찾을 수 없습니다.';

function viewFilter(view: AdminView) {
  const sql = db();
  if (view === 'open') return sql`r.hidden_at is null and r.status in ('received', 'in_progress')`;
  if (view === 'done') return sql`r.hidden_at is null and r.status in ('resolved', 'declined')`;
  if (view === 'hidden') return sql`r.hidden_at is not null`;
  return sql`r.hidden_at is null`;
}

export async function listAdminReports(view: AdminView, page: number) {
  const sql = db();
  const reports = await sql<AdminReportRow[]>`
    select r.id, p.name as nickname, r.category, r.title, r.drug_name as "drugName", r.status,
      r.hidden_at as "hiddenAt", r.created_at as "createdAt"
    from error_board.reports r
    join error_board.reporters p on p.id = r.reporter_id
    where ${viewFilter(view)}
    order by r.created_at desc
    limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`;
  const [counts] = await sql<Record<AdminView, number>[]>`
    select
      count(*) filter (where hidden_at is null and status in ('received', 'in_progress'))::int as open,
      count(*) filter (where hidden_at is null and status in ('resolved', 'declined'))::int as done,
      count(*) filter (where hidden_at is not null)::int as hidden,
      count(*) filter (where hidden_at is null)::int as "all"
    from error_board.reports`;
  return { reports: [...reports], counts };
}

export async function getAdminReport(id: string): Promise<{ report: AdminReport; events: ReportEvent[] } | null> {
  const sql = db();
  const [report] = await sql<AdminReport[]>`
    select r.id, p.name as nickname, r.category, r.title, r.body, r.item_seq as "itemSeq", r.drug_name as "drugName",
      r.drug_company as "drugCompany", r.status, r.admin_reply as "adminReply", r.hidden_at as "hiddenAt",
      r.hidden_reason as "hiddenReason", r.resolved_at as "resolvedAt", r.created_at as "createdAt"
    from error_board.reports r
    join error_board.reporters p on p.id = r.reporter_id
    where r.id = ${id}`;
  if (!report) return null;
  const events = await sql<ReportEvent[]>`
    select id, admin_name as "adminName", action, from_status as "fromStatus", to_status as "toStatus",
      admin_reply as "adminReply", hidden_reason as "hiddenReason", created_at as "createdAt"
    from error_board.report_events
    where report_id = ${id}
    order by created_at desc, id desc`;
  return { report, events: [...events] };
}

/** 상태와 답변 저장. 바뀐 항목만 이력에 남기고, 바뀐 것이 없으면 false */
export async function saveReport(id: string, admin: Admin, status: ReportStatus, reply: string | null): Promise<boolean> {
  return db().begin(async (tx) => {
    const [current] = await tx<{ status: ReportStatus; admin_reply: string | null }[]>`
      select status, admin_reply from error_board.reports where id = ${id} for update`;
    if (!current) throw new AdminError(NOT_FOUND);
    const statusChanged = current.status !== status;
    const replyChanged = current.admin_reply !== reply;
    if (!statusChanged && !replyChanged) return false;

    await tx`
      update error_board.reports
      set status = ${status}, admin_reply = ${reply}, handled_by = ${admin.id}
      where id = ${id}`;
    if (statusChanged) {
      await tx`
        insert into error_board.report_events (report_id, admin_id, admin_name, action, from_status, to_status)
        values (${id}, ${admin.id}, ${admin.name}, 'status_changed', ${current.status}, ${status})`;
    }
    if (replyChanged) {
      await tx`
        insert into error_board.report_events (report_id, admin_id, admin_name, action, admin_reply)
        values (${id}, ${admin.id}, ${admin.name}, 'replied', ${reply})`;
    }
    return true;
  });
}

/** 숨기기(reason 있음) 또는 숨김 해제(reason null) */
export async function setReportHidden(id: string, admin: Admin, reason: string | null): Promise<void> {
  await db().begin(async (tx) => {
    const [current] = await tx<{ hidden: boolean }[]>`
      select hidden_at is not null as hidden from error_board.reports where id = ${id} for update`;
    if (!current) throw new AdminError(NOT_FOUND);
    if (current.hidden === (reason !== null)) {
      throw new AdminError(reason ? '이미 숨긴 신고입니다.' : '숨긴 신고가 아닙니다.');
    }
    await tx`
      update error_board.reports
      set hidden_at = ${reason === null ? null : new Date()}, hidden_reason = ${reason}, handled_by = ${admin.id}
      where id = ${id}`;
    await tx`
      insert into error_board.report_events (report_id, admin_id, admin_name, action, hidden_reason)
      values (${id}, ${admin.id}, ${admin.name}, ${reason === null ? 'unhidden' : 'hidden'}, ${reason})`;
  });
}
