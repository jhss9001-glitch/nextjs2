import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

const MENU = [
  { href: '/reports', label: '신고 목록' },
  { href: '/reports/new', label: '오류 신고하기' },
  { href: '/reports/mine', label: '내 신고 확인' }
];

/** 오류 신고 게시판 공통 틀 */
export default function BoardShell({
  active,
  title,
  description,
  children
}: {
  active: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader active="/reports" />
      <main className="board-page">
        <nav className="board-nav" aria-label="오류 신고 메뉴">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              prefetch={false}
              className={m.href === active ? 'board-nav-on' : undefined}
              aria-current={m.href === active ? 'page' : undefined}
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <h1 className="board-title">{title}</h1>
        <p className="board-muted">{description}</p>
        {children}
      </main>
    </>
  );
}
