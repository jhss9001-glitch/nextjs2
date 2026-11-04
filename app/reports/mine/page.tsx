import type { Metadata } from 'next';
import BoardShell from '@/components/board/BoardShell';
import MyReports from '@/components/board/MyReports';

export const metadata: Metadata = { title: '내 신고 확인 · 약속 YakSok' };

export default function MyReportsPage() {
  return (
    <BoardShell active="/reports/mine" title="내 신고 확인" description="신고할 때 입력한 닉네임과 비밀번호로 내용과 처리 결과를 볼 수 있습니다.">
      <MyReports />
    </BoardShell>
  );
}
