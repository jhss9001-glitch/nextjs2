import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { HideForm, ReportEditor, UnhideForm } from '@/components/admin/AdminForms';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin-auth';
import { getAdminReport, type ReportEvent } from '@/lib/admin-reports';
import { CATEGORY_LABEL, STATUS_LABEL, formatKst } from '@/lib/report-meta';

export const metadata: Metadata = { title: '신고 처리 · 약속 YakSok', robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function describeEvent(e: ReportEvent): string {
  if (e.action === 'status_changed') {
    return `상태 변경: ${e.fromStatus ? STATUS_LABEL[e.fromStatus] : '-'} → ${e.toStatus ? STATUS_LABEL[e.toStatus] : '-'}`;
  }
  if (e.action === 'replied') return e.adminReply ? `답변 저장: ${e.adminReply}` : '답변 삭제';
  if (e.action === 'hidden') return `숨김: ${e.hiddenReason ?? ''}`;
  return '숨김 해제';
}

async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const result = await getAdminReport(id);
  if (!result) notFound();
  const { report: r, events } = result;

  return (
    <>
      <Link className="admin-back" href="/admin" prefetch={false}>← 목록으로</Link>
      <article className="board-card">
        <div className="board-card-head">
          <h1 className="admin-report-title">{r.title}</h1>
          <span className={`board-status board-status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
        </div>
        <p className="board-muted">{r.nickname} · {CATEGORY_LABEL[r.category]} · {formatKst(r.createdAt)} 접수</p>
        {r.drugName && (
          <dl className="admin-drug">
            <dt>약</dt><dd>{r.drugName}</dd>
            {r.drugCompany && <><dt>업체</dt><dd>{r.drugCompany}</dd></>}
            <dt>품목기준코드</dt><dd>{r.itemSeq}</dd>
          </dl>
        )}
        <p className="board-body">{r.body}</p>
      </article>

      <section className="board-card" aria-label="처리">
        {/* 다른 신고를 열 때 이전 신고의 입력값이 남지 않도록 신고마다 새 폼으로 */}
        <ReportEditor key={r.id} id={r.id} status={r.status} reply={r.adminReply} />
      </section>

      <section className="board-card" aria-label="공개 여부">
        {r.hiddenAt ? (
          <>
            <p className="board-body">공개 목록에서 숨긴 신고입니다. 이유: {r.hiddenReason}</p>
            <UnhideForm key={r.id} id={r.id} />
          </>
        ) : (
          <HideForm key={r.id} id={r.id} />
        )}
      </section>

      <section className="board-card">
        <h2 className="admin-section-title">처리 이력</h2>
        {events.length === 0 ? (
          <p className="board-muted">아직 처리 이력이 없습니다.</p>
        ) : (
          <ul className="admin-events">
            {events.map((e) => (
              <li key={e.id}>
                <span className="board-body">{describeEvent(e)}</span>
                <span className="board-muted">{e.adminName} · {formatKst(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AdminShell>
      <Suspense fallback={<p className="board-muted">불러오는 중…</p>}>
        <ReportDetail params={params} />
      </Suspense>
    </AdminShell>
  );
}
