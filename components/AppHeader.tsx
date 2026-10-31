'use client';

import BrandMark from '@/components/BrandMark';
import { displayEn, useAutoTranslate } from '@/components/KoInput';
import type { Tr } from '@/lib/types';

export default function AppHeader({
  pharmacy,
  onPharmacyChange,
  search
}: {
  pharmacy: Tr;
  onPharmacyChange: (v: Tr) => void;
  search: React.ReactNode;
}) {
  // 약국명도 한국어로 입력하면 영어 안내문용 이름을 자동 번역 (예: 행복약국 → Haengbok Pharmacy)
  const tr = useAutoTranslate('pharmacy', pharmacy, onPharmacyChange, 1200);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <BrandMark />
          <span className="brand-word">
            <strong>약속</strong>
            <span>YAKSOK · 영문 복약지도</span>
          </span>
        </div>
        <div className="topbar-search">{search}</div>
        <label className="topbar-pharmacy">
          {/* 약국명 첫 글자 (비어 있으면 '약') */}
          <span className="pharmacy-mark" aria-hidden="true">{pharmacy.ko.trim().charAt(0) || '약'}</span>
          <span className="sr-only">약국명</span>
          <span className="pharmacy-box">
            <input
              id="pharmacyName"
              type="text"
              placeholder="약국명 (선택)"
              value={pharmacy.ko}
              onChange={(e) => onPharmacyChange({ ko: e.target.value, en: '' })}
            />
            {pharmacy.ko.trim() && (
              <span className="pharmacy-en" lang="en">
                {tr.loading ? '번역 중…' : tr.error ? '번역 실패' : displayEn('pharmacy', pharmacy.en)}
              </span>
            )}
          </span>
        </label>
      </div>
    </header>
  );
}
