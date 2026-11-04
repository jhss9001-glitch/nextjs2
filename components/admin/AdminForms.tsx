'use client';

import { Alert, Button, PasswordInput, Select, Textarea, TextInput } from '@mantine/core';
import { startTransition, useActionState, type FormEvent } from 'react';
import { adminSignIn, hideReportAction, saveReportAction, unhideReportAction } from '@/lib/admin-actions';
import { STATUS_LABEL, type AdminFormState, type ReportStatus } from '@/lib/report-meta';

const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

function ActionForm({
  action,
  submitLabel,
  submitColor,
  submitVariant,
  extraSubmit,
  children
}: {
  action: (prev: AdminFormState, form: FormData) => Promise<AdminFormState>;
  submitLabel: string;
  submitColor?: string;
  submitVariant?: string;
  extraSubmit?: { label: string; name: string };
  children: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, {});

  // form action을 바로 쓰면 제출 후 입력값이 지워져서, 값이 남도록 직접 실행
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 어떤 버튼을 눌렀는지도 함께 보냄
    const data = new FormData(e.currentTarget, e.nativeEvent instanceof SubmitEvent ? e.nativeEvent.submitter : null);
    startTransition(() => run(data));
  };

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {children}
      {state.error && <Alert color="red">{state.error}</Alert>}
      {state.notice && <Alert color="brand">{state.notice}</Alert>}
      <div className="admin-form-buttons">
        <Button type="submit" loading={pending} color={submitColor} variant={submitVariant}>{submitLabel}</Button>
        {extraSubmit && <Button type="submit" name={extraSubmit.name} value="1" loading={pending}>{extraSubmit.label}</Button>}
      </div>
    </form>
  );
}

export function AdminLoginForm() {
  return (
    <ActionForm action={adminSignIn} submitLabel="로그인">
      <TextInput name="email" type="email" label="이메일" autoComplete="email" required />
      <PasswordInput name="password" label="비밀번호" autoComplete="current-password" required />
    </ActionForm>
  );
}

export function ReportEditor({ id, status, reply }: { id: string; status: ReportStatus; reply: string | null }) {
  return (
    <ActionForm
      action={saveReportAction}
      submitLabel="저장"
      submitVariant={status === 'resolved' ? undefined : 'default'}
      extraSubmit={status === 'resolved' ? undefined : { label: '처리 완료로 저장', name: 'complete' }}
    >
      <input type="hidden" name="id" value={id} />
      {/* 저장 후 상태가 바뀌면 새 상태가 보이도록 다시 그림 */}
      <Select key={status} name="status" label="처리 상태" data={STATUS_OPTIONS} defaultValue={status} allowDeselect={false} required />
      <Textarea
        name="reply"
        label="운영자 답변"
        description="신고자가 내 신고 확인에서 볼 수 있습니다."
        defaultValue={reply ?? ''}
        maxLength={2000}
        autosize
        minRows={4}
      />
    </ActionForm>
  );
}

export function HideForm({ id }: { id: string }) {
  return (
    <ActionForm action={hideReportAction} submitLabel="공개 목록에서 숨기기" submitColor="red" submitVariant="outline">
      <input type="hidden" name="id" value={id} />
      <TextInput name="reason" label="숨기는 이유" description="관리자만 볼 수 있습니다." maxLength={300} required />
    </ActionForm>
  );
}

export function UnhideForm({ id }: { id: string }) {
  return (
    <ActionForm action={unhideReportAction} submitLabel="숨김 해제" submitVariant="default">
      <input type="hidden" name="id" value={id} />
    </ActionForm>
  );
}
