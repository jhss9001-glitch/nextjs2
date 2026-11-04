import type { Metadata } from 'next';
import BoardShell from '@/components/board/BoardShell';
import ReportForm from '@/components/board/ReportForm';

export const metadata: Metadata = { title: '오류 신고하기 · 약속 YakSok' };

export default function NewReportPage() {
  return (
    <BoardShell active="/reports/new" title="오류 신고하기" description="회원가입 없이 닉네임과 숫자 비밀번호만으로 신고하고 처리 결과를 확인할 수 있습니다.">
      <ReportForm />
    </BoardShell>
  );
}
