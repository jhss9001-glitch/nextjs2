import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { adminSignOut } from '@/lib/admin-actions';

/** 관리자 화면 공통 틀. 공개 메뉴에는 넣지 않음 */
export default function AdminShell({ signedIn = true, children }: { signedIn?: boolean; children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand site-brand" href="/admin" prefetch={false}>
            <BrandMark />
            <span className="brand-word">
              <strong>약속 관리자</strong>
              <span>오류 신고 처리</span>
            </span>
          </Link>
          {signedIn && (
            <form action={adminSignOut} className="admin-signout">
              <button type="submit" className="board-button">로그아웃</button>
            </form>
          )}
        </div>
      </header>
      <main className="board-page admin-page">{children}</main>
    </>
  );
}
