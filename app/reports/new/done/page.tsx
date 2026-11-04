import type { Metadata } from 'next';
import Link from 'next/link';
import BoardShell from '@/components/board/BoardShell';

export const metadata: Metadata = { title: '신고 접수 완료 · 약속 YakSok' };

export default function ReportDonePage() {
  return (
    <BoardShell active="/reports/new" title="신고가 접수되었습니다" description="처리 상태는 내 신고 확인에서 닉네임과 비밀번호로 볼 수 있습니다.">
      <div className="board-actions">
        <Link className="board-button board-button-primary" href="/reports/new" prefetch={false}>다른 오류 신고하기</Link>
        <Link className="board-button" href="/reports/mine" prefetch={false}>내 신고 확인</Link>
        <Link className="board-button" href="/reports" prefetch={false}>신고 목록</Link>
      </div>
    </BoardShell>
  );
}
