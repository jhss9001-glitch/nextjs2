'use client';

import { Alert, Button, PasswordInput, Select, Textarea, TextInput } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useRef, useState, type FormEvent } from 'react';
import DrugSearch from '@/components/DrugSearch';
import { submitReport } from '@/lib/report-actions';
import { CATEGORY_LABEL, DRUG_OPTIONAL, type ReportCategory, type SubmitState } from '@/lib/report-meta';
import type { Drug } from '@/lib/types';

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

export default function ReportForm() {
  // 이동한 뒤에도 화면 상태가 남을 수 있어서, 접수되면 입력값을 새 폼으로 비움
  const [round, setRound] = useState(0);
  return <ReportFields key={round} onDone={() => setRound((r) => r + 1)} />;
}

function ReportFields({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [state, run, pending] = useActionState(async (prev: SubmitState, form: FormData) => {
    const result = await submitReport(prev, form);
    if (result.done) {
      router.push('/reports/new/done');
      onDone();
    }
    return result;
  }, {});
  const [category, setCategory] = useState<ReportCategory>('translation');
  const [drug, setDrug] = useState<Drug | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optional = DRUG_OPTIONAL.includes(category);

  // form action을 바로 쓰면 제출 후 입력값이 지워져서, 오류가 나도 값이 남도록 직접 실행
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };

  return (
    <form className="board-form" onSubmit={onSubmit}>
      <Select
        name="category"
        label="분류"
        data={CATEGORY_OPTIONS}
        value={category}
        allowDeselect={false}
        onChange={(v) => setCategory(v as ReportCategory)}
        required
      />

      <div className="board-field">
        <span className="board-label">약 선택{optional ? ' (선택)' : ''}</span>
        {drug?.mfds ? (
          <div className="board-drug">
            <div>
              <strong>{drug.brand}</strong>
              <div className="board-muted">{[drug.mfds.entpName, `품목기준코드 ${drug.mfds.itemSeq}`].filter(Boolean).join(' · ')}</div>
            </div>
            <Button type="button" variant="default" onClick={() => setDrug(null)}>변경</Button>
            <input type="hidden" name="itemSeq" value={drug.mfds.itemSeq} />
            <input type="hidden" name="drugName" value={drug.brand} />
            <input type="hidden" name="drugCompany" value={drug.mfds.entpName} />
          </div>
        ) : (
          // 검색창의 Enter가 신고 제출로 이어지지 않게 막음 (결과 선택은 검색창이 먼저 처리)
          <div onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
            <DrugSearch
              inputRef={searchRef}
              onSelect={setDrug}
              emptyText="검색 결과가 없습니다. 분류를 “기타”로 바꾸고 내용에 약 이름을 적어 주세요."
            />
          </div>
        )}
      </div>

      <TextInput name="title" label="제목" description="제목은 모두에게 공개됩니다. 환자 정보를 쓰지 마세요." maxLength={100} required />
      <Textarea
        name="body"
        label="내용"
        description="본인과 운영자만 볼 수 있습니다. 환자 이름, 연락처 같은 정보는 쓰지 마세요."
        maxLength={2000}
        autosize
        minRows={5}
        required
      />
      <TextInput
        name="name"
        label="이름 또는 닉네임"
        description="목록에 공개됩니다. 처리 결과를 확인할 때 다시 입력합니다."
        maxLength={30}
        autoComplete="off"
        required
      />
      <PasswordInput
        name="password"
        label="비밀번호 (숫자 6자리 이상)"
        description="잊어버리면 찾을 수 없습니다. 은행 비밀번호나 생년월일은 쓰지 마세요."
        inputMode="numeric"
        pattern="[0-9]{6,32}"
        maxLength={32}
        autoComplete="off"
        required
      />
      <PasswordInput
        name="passwordConfirm"
        label="비밀번호 확인"
        inputMode="numeric"
        pattern="[0-9]{6,32}"
        maxLength={32}
        autoComplete="off"
        required
      />

      {state.error && <Alert color="red">{state.error}</Alert>}
      <Button type="submit" loading={pending}>신고하기</Button>
    </form>
  );
}
