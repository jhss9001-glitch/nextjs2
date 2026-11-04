import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin-auth';
import { listAdminReports, type AdminView } from '@/lib/admin-reports';
import { CATEGORY_LABEL, STATUS_LABEL, formatKst } from '@/lib/report-meta';
import { PAGE_SIZE } from '@/lib/reports';

export const metadata: Metadata = { title: '오류 신고 처리 · 약속 YakSok', robots: { index: false } };

const VIEWS: { key: AdminView; label: string }[] = [
  { key: 'open', label: '처리 필요' },
  { key: 'done', label: '처리 끝남' },
  { key: 'hidden', label: '숨김' },
  { key: 'all', label: '전체' }
];

type SearchParams = Promise<{ view?: string; page?: string }>;

async function AdminReports({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const view = VIEWS.find((v) => v.key === params.view)?.key ?? 'open';
  const requested = Number(params.page);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const { reports, counts } = await listAdminReports(view, page);
  const lastPage = Math.max(1, Math.ceil(counts[view] / PAGE_SIZE));

  return (
    <>
      <nav className="board-nav" aria-label="신고 분류">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin?view=${v.key}`}
            prefetch={false}
            className={v.key === view ? 'board-nav-on' : undefined}
            aria-current={v.key === view ? 'page' : undefined}
          >
            {v.label} {counts[v.key]}
          </Link>
        ))}
      </nav>
      {reports.length === 0 ? (
        <p className="board-muted">해당하는 신고가 없습니다.</p>
      ) : (
        <ul className="board-list">
          {reports.map((r) => (
            <li key={r.id}>
              <div className="board-row-main">
                <Link className="admin-row-link" href={`/admin/reports/${r.id}`} prefetch={false}>{r.title}</Link>
                <span className="board-muted">
                  {[r.nickname, CATEGORY_LABEL[r.category], r.drugName].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className="board-row-end">
                <span className={`board-status board-status-${r.status}`}>
                  {r.hiddenAt ? '숨김 · ' : ''}{STATUS_LABEL[r.status]}
                </span>
                <time className="board-muted" dateTime={r.createdAt.toISOString()}>{formatKst(r.createdAt)} 접수</time>
              </div>
            </li>
          ))}
        </ul>
      )}
      <nav className="board-pages" aria-label="페이지">
        {page > 1 ? <Link href={`/admin?view=${view}&page=${page - 1}`} prefetch={false}>이전</Link> : <span />}
        <span className="board-muted">{page} / {lastPage}</span>
        {page < lastPage ? <Link href={`/admin?view=${view}&page=${page + 1}`} prefetch={false}>다음</Link> : <span />}
      </nav>
    </>
  );
}

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AdminShell>
      <h1 className="board-title">오류 신고 처리</h1>
      <Suspense fallback={<p className="board-muted">불러오는 중…</p>}>
        <AdminReports searchParams={searchParams} />
      </Suspense>
    </AdminShell>
  );
}
