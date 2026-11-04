'use client';

import { Alert, Button, PasswordInput, TextInput } from '@mantine/core';
import { startTransition, useActionState, type FormEvent } from 'react';
import { lookUpMyReports } from '@/lib/report-actions';
import { CATEGORY_LABEL, STATUS_LABEL, formatKst, type MyReport } from '@/lib/report-meta';

function ReportCard({ report: r }: { report: MyReport }) {
  return (
    <article className="board-card">
      <div className="board-card-head">
        <h2>{r.title}</h2>
        <span className={`board-status board-status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
      </div>
      <p className="board-muted">{CATEGORY_LABEL[r.category]} · {formatKst(r.createdAt)}</p>
      {r.drugName && (
        <p className="board-muted">{[r.drugName, r.drugCompany, r.itemSeq && `품목기준코드 ${r.itemSeq}`].filter(Boolean).join(' · ')}</p>
      )}
      <p className="board-body">{r.body}</p>
      {r.adminReply && (
        <div className="board-reply">
          <strong>운영자 답변</strong>
          {r.resolvedAt && <span className="board-muted"> · {formatKst(r.resolvedAt)}</span>}
          <p className="board-body">{r.adminReply}</p>
        </div>
      )}
    </article>
  );
}

export default function MyReports() {
  const [state, run, pending] = useActionState(lookUpMyReports, {});

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };

  return (
    <>
      <form className="board-form" onSubmit={onSubmit}>
        <TextInput name="name" label="이름 또는 닉네임" maxLength={30} autoComplete="off" required />
        <PasswordInput name="password" label="비밀번호" inputMode="numeric" maxLength={32} autoComplete="off" required />
        {state.error && <Alert color="red">{state.error}</Alert>}
        <Button type="submit" loading={pending}>확인하기</Button>
      </form>

      {state.reports?.length === 0 && <p className="board-muted">아직 작성한 신고가 없습니다.</p>}
      {state.reports?.map((r) => <ReportCard key={r.id} report={r} />)}
    </>
  );
}
