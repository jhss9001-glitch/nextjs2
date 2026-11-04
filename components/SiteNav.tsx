import Link from 'next/link';

const MENU = [
  { href: '/', label: '메인페이지' },
  { href: '/reports', label: '오류 신고' },
  { href: '/faq', label: 'FAQ' }
];

/** 모든 페이지 상단의 주요 메뉴 */
export default function SiteNav({ active }: { active: string }) {
  return (
    <nav className="site-nav" aria-label="주요 메뉴">
      {MENU.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          prefetch={false}
          className={m.href === active ? 'site-nav-on' : undefined}
          aria-current={m.href === active ? 'page' : undefined}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
