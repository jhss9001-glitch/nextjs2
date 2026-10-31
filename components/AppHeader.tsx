export default function AppHeader({
  pharmacy,
  onPharmacyChange
}: {
  pharmacy: string;
  onPharmacyChange: (v: string) => void;
}) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo" aria-hidden="true">Rx</span>
        <div>
          <h1>다국어 복약지도 가이드</h1>
          <p>English · 中文 · 日本語</p>
        </div>
      </div>
      <label className="pharmacy-field">
        약국명
        <input
          id="pharmacyName"
          type="text"
          placeholder="예: 행복약국 (선택)"
          value={pharmacy}
          onChange={(e) => onPharmacyChange(e.target.value)}
        />
      </label>
    </header>
  );
}
