'use client';

import { useState } from 'react';

/**
 * 식약처 약 사진 (nedrug.mfds.go.kr)
 *  - 인쇄에도 그대로 나오도록 next/image 대신 일반 img 사용
 *  - 사진을 못 불러오면 깨진 그림 대신 숨김
 */
export default function PillPhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(src)} />
  );
}
