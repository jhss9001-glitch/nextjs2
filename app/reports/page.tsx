import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BoardShell from '@/components/board/BoardShell';
import { CATEGORY_LABEL, STATUS_LABEL, formatKst } from '@/lib/report-meta';
import { PAGE_SIZE, listPublicReports } from '@/lib/reports';

export const metadata: Metadata = { title: '오류 신고 · 약속 YakSok' };

type SearchParams = Promise<{ page?: string }>;

async function ReportList({ searchParams }: { searchParams: SearchParams }) {
  const requested = Number((await searchParams).page);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;

  let result;
  try {
    result = await listPublicReports(page);
  } catch (e) {
    console.error('오류 신고 목록 조회 실패', (e as Error).message);
    return <p className="board-muted">목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.</p>;
  }
  const { reports, total } = result;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!reports.length && page === 1) {
    return <p className="board-muted">아직 접수된 신고가 없습니다.</p>;
  }
  return (
    <>
      <ul className="board-list">
        {reports.map((r) => (
          <li key={r.id}>
            <div className="board-row-main">
              <strong>{r.title}</strong>
              <span className="board-muted">{r.nickname} · {CATEGORY_LABEL[r.category]}</span>
            </div>
            <div className="board-row-end">
              <span className={`board-status board-status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
              <time className="board-muted" dateTime={r.createdAt.toISOString()}>{formatKst(r.createdAt)} 접수</time>
            </div>
          </li>
        ))}
      </ul>
      <nav className="board-pages" aria-label="페이지">
        {page > 1 ? <Link href={`/reports?page=${page - 1}`} prefetch={false}>이전</Link> : <span />}
        <span className="board-muted">{page} / {lastPage}</span>
        {page < lastPage ? <Link href={`/reports?page=${page + 1}`} prefetch={false}>다음</Link> : <span />}
      </nav>
    </>
  );
}

export default function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <BoardShell active="/reports" title="오류 신고" description="접수된 오류와 처리 상태입니다. 내용은 작성자와 운영자만 볼 수 있습니다.">
      <Suspense fallback={<p className="board-muted">불러오는 중…</p>}>
        <ReportList searchParams={searchParams} />
      </Suspense>
    </BoardShell>
  );
}
