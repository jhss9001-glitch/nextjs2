/** 약속 로고: 캡슐 두 반쪽이 맞물리는 모양 (약사와 환자의 약속) */
export default function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="10" fill="#0e6f63" />
      <g transform="rotate(-38 17 17)">
        <path d="M10.5 12.5h6.5v9h-6.5a4.5 4.5 0 0 1 0-9z" fill="#ffffff" />
        <path d="M17 12.5h6.5a4.5 4.5 0 0 1 0 9H17z" fill="#7cc4b6" />
        <path d="M17 12.5v9" stroke="#0e6f63" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
