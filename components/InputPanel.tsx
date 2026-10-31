'use client';

import DrugSearch from '@/components/DrugSearch';
import RxList from '@/components/RxList';
import SelectedDrugCard from '@/components/SelectedDrugCard';
import { GENERAL, TIMINGS, UNITS } from '@/data/rx-data';
import { directions } from '@/lib/sentences';
import type { Drug, FormState, GeneralKey, Item, Route, TimingKey, UnitKey } from '@/lib/types';

interface Props {
  drug: Drug | null;
  custom: boolean;
  customName: string;
  customRoute: Route;
  route: Route;
  form: FormState;
  preview: Item;
  list: Item[];
  editIndex: number | null;
  clearArmed: boolean;
  searchRef: React.RefObject<HTMLInputElement | null>;
  customNameRef: React.RefObject<HTMLInputElement | null>;
  onSelectDrug: (id: string) => void;
  onClearDrug: () => void;
  onToggleCustom: () => void;
  onCustomName: (v: string) => void;
  onCustomRoute: (r: Route) => void;
  onForm: (patch: Partial<FormState>) => void;
  onAdd: () => void;
  onCancelEdit: () => void;
  onUp: (i: number) => void;
  onEdit: (i: number) => void;
  onDelete: (i: number) => void;
  onClearAll: () => void;
}

const DAYS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 28, 30];
const INTERVALS = [4, 6, 8, 12];
const MAXES = [1, 2, 3, 4, 5, 6, 7, 8];

export default function InputPanel({ searchRef, customNameRef, ...p }: Props) {
  const { form, route } = p;
  const prn = form.freq === 'prn';

  const toggleGeneral = (k: GeneralKey, checked: boolean) =>
    p.onForm({ general: checked ? [...form.general, k] : form.general.filter((g) => g !== k) });

  return (
    <section className="panel input-panel" aria-label="복약 정보 입력">
      <div className="step">
        <h2><span className="num">1</span>약 선택</h2>
        <DrugSearch onSelect={p.onSelectDrug} inputRef={searchRef} />

        <SelectedDrugCard drug={p.drug} onClear={p.onClearDrug} />

        <button type="button" id="customToggle" className="link-btn" onClick={p.onToggleCustom}>
          {p.custom ? '− 직접 입력 취소' : '+ 목록에 없는 약 직접 입력'}
        </button>
        <div id="customFields" className="custom-fields" hidden={!p.custom}>
          <label>약 이름 (출력 시 그대로 표시)
            <input
              id="customName"
              type="text"
              placeholder="예: Cefaclor 250mg"
              ref={customNameRef}
              value={p.customName}
              onChange={(e) => p.onCustomName(e.target.value)}
            />
          </label>
          <label>사용 경로
            <select id="customRoute" value={p.customRoute} onChange={(e) => p.onCustomRoute(e.target.value as Route)}>
              <option value="oral">내복 (먹는 약)</option>
              <option value="eye">점안 (안약)</option>
              <option value="topical">외용 (바르는 약)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="step">
        <h2><span className="num">2</span>복용 방법</h2>
        <div className="form-grid">
          <label id="fQty" hidden={route === 'topical'}>1회 용량
            <span className="inline">
              <input
                id="qty"
                type="number"
                min="0.5"
                step="0.5"
                value={form.qty}
                onChange={(e) => p.onForm({ qty: e.target.value })}
              />
              <select
                id="unit"
                value={form.unit}
                disabled={route === 'eye'}
                onChange={(e) => p.onForm({ unit: e.target.value as UnitKey })}
              >
                {Object.entries(UNITS).map(([k, u]) => <option key={k} value={k}>{u.label}</option>)}
              </select>
            </span>
          </label>
          <label>1일 횟수
            <select id="freq" value={form.freq} onChange={(e) => p.onForm({ freq: e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={String(n)}>1일 {n}회</option>)}
              <option value="prn">필요시 (증상이 있을 때)</option>
            </select>
          </label>
          <label id="fTiming" hidden={route !== 'oral' || prn}>복용 시점
            <select id="timing" value={form.timing} onChange={(e) => p.onForm({ timing: e.target.value as TimingKey })}>
              {Object.entries(TIMINGS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
            </select>
          </label>
          <label>기간
            <select id="days" value={form.days} onChange={(e) => p.onForm({ days: e.target.value })}>
              <option value="">지정 안 함</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </label>
          <label id="fInterval" hidden={route !== 'oral' || !prn}>최소 복용 간격
            <select id="interval" value={form.interval} onChange={(e) => p.onForm({ interval: e.target.value })}>
              <option value="">지정 안 함</option>
              {INTERVALS.map((h) => <option key={h} value={h}>{h}시간</option>)}
            </select>
          </label>
          <label id="fMax" hidden={!prn}>1일 최대 횟수
            <select id="maxDaily" value={form.maxDaily} onChange={(e) => p.onForm({ maxDaily: e.target.value })}>
              <option value="">지정 안 함</option>
              {MAXES.map((n) => <option key={n} value={n}>{n}회</option>)}
            </select>
          </label>
        </div>
        <p id="previewKo" className="preview-ko">미리보기: {directions(p.preview, 'ko').join(' ')}</p>
      </div>

      <div className="step">
        <h2><span className="num">3</span>추가 주의사항</h2>
        <div id="generalList" className="checks">
          {(Object.entries(GENERAL) as [GeneralKey, (typeof GENERAL)[GeneralKey]][]).map(([k, g]) => (
            <label className="check" key={k}>
              <input
                type="checkbox"
                value={k}
                checked={form.general.includes(k)}
                onChange={(e) => toggleGeneral(k, e.target.checked)}
              />
              <span>{g.ko}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="add-row">
        <button type="button" id="addBtn" className="primary" onClick={p.onAdd}>
          {p.editIndex !== null ? '수정 완료' : '목록에 추가'}
        </button>
        <button type="button" id="cancelEditBtn" className="ghost" hidden={p.editIndex === null} onClick={p.onCancelEdit}>
          수정 취소
        </button>
      </div>

      <RxList
        list={p.list}
        editIndex={p.editIndex}
        clearArmed={p.clearArmed}
        onUp={p.onUp}
        onEdit={p.onEdit}
        onDelete={p.onDelete}
        onClear={p.onClearAll}
      />
    </section>
  );
}
