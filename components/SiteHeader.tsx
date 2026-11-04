import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import SiteNav from '@/components/SiteNav';

/** 메인 도구 외의 페이지에 쓰는 상단 바 */
export default function SiteHeader({ active }: { active: string }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand site-brand" href="/" prefetch={false}>
          <BrandMark />
          <span className="brand-word">
            <strong>약속</strong>
            <span>YAKSOK · 영문 복약지도</span>
          </span>
        </Link>
        <SiteNav active={active} />
      </div>
    </header>
  );
}
