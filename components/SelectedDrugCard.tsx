import type { Drug } from '@/lib/types';

export default function SelectedDrugCard({ drug, onClear }: { drug: Drug | null; onClear: () => void }) {
  return (
    <div id="selectedDrug" className="selected-drug" hidden={!drug}>
      {drug && (
        <>
          <div className="sd-head">
            <div>
              <strong>{drug.brand}</strong>
              <span className="badge">{drug.cat}</span>
              <div className="sd-ing">{drug.ing.ko} · {drug.ing.en}</div>
            </div>
            <button type="button" className="icon-btn" aria-label="선택 해제" onClick={onClear}>✕</button>
          </div>
          <div className="sd-use"><b>효능</b> {drug.use.ko}</div>
          {drug.warn.length > 0 && (
            <div className="sd-warn">
              <b>약품별 주의사항 (자동 포함)</b>
              <ul>{drug.warn.map((w, i) => <li key={i}>{w.ko}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
