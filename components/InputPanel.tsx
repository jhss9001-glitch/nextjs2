'use client';

import { Button, NumberInput, Select, TextInput, type SelectProps } from '@mantine/core';
import { useState } from 'react';
import DrugSearch from '@/components/DrugSearch';
import RxList from '@/components/RxList';
import SelectedDrugCard from '@/components/SelectedDrugCard';
import { GENERAL, TIMINGS, UNITS } from '@/data/rx-data';
import { directions } from '@/lib/sentences';
import type { Drug, FormState, GeneralKey, Item, Route, TimingKey, Tr, UnitKey } from '@/lib/types';

interface Props {
  drug: Drug | null;
  custom: boolean;
  customName: string;
  form: FormState;
  preview: Item;
  list: Item[];
  editIndex: number | null;
  clearArmed: boolean;
  searchRef: React.RefObject<HTMLInputElement | null>;
  customNameRef: React.RefObject<HTMLInputElement | null>;
  onSelectDrug: (d: Drug) => void;
  onClearDrug: () => void;
  onEnName: (v: string) => void;
  onToggleCustom: () => void;
  onCustomName: (v: string) => void;
  onRoute: (r: Route) => void;
  onForm: (patch: Partial<FormState>) => void;
  onAdd: () => void;
  onCancelEdit: () => void;
  onUp: (i: number) => void;
  onEdit: (i: number) => void;
  onDelete: (i: number) => void;
  onClearAll: () => void;
}

const ROUTE_LABEL: Record<Route, string> = { oral: '내복 (먹는 약)', eye: '점안 (안약)', topical: '외용 (바르는 약)' };
const opt = (value: string | number, label: string) => ({ value: String(value), label });
const ROUTES = (Object.keys(ROUTE_LABEL) as Route[]).map((r) => opt(r, ROUTE_LABEL[r]));
const UNIT_OPTS = Object.entries(UNITS).map(([k, u]) => opt(k, u.label));
const FREQS = [...[1, 2, 3, 4, 5, 6].map((n) => opt(n, `1일 ${n}회`)), opt('prn', '필요시 (증상이 있을 때)')];
const TIMING_OPTS = Object.entries(TIMINGS).map(([k, t]) => opt(k, t.label));
const NONE = opt('', '지정 안 함');
const DAYS = [NONE, ...[1, 2, 3, 4, 5, 6, 7, 10, 14, 28, 30].map((d) => opt(d, `${d}일`))];
const INTERVALS = [NONE, ...[4, 6, 8, 12].map((h) => opt(h, `${h}시간`))];
const MAXES = [NONE, ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => opt(n, `${n}회`))];

// 모든 선택 박스 공통 설정
const sel: Partial<SelectProps> = {
  allowDeselect: false,
  checkIconPosition: 'right',
  comboboxProps: { shadow: 'md', transitionProps: { transition: 'pop', duration: 120 } },
  maxDropdownHeight: 280
};

function NotesInput({ notes, onChange }: { notes: Tr[]; onChange: (n: Tr[]) => void }) {
  const [en, setEn] = useState('');
  const [ko, setKo] = useState('');
  const add = () => {
    if (!en.trim()) return;
    onChange([...notes, { en: en.trim(), ko: ko.trim() }]);
    setEn('');
    setKo('');
  };
  return (
    <div className="notes">
      <div className="notes-title">직접 입력</div>
      {notes.length > 0 && (
        <ul className="notes-list">
          {notes.map((n, i) => (
            <li key={i}>
              <div>
                <span>{n.en}</span>
                {n.ko && <small>{n.ko}</small>}
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label="삭제"
                onClick={() => onChange(notes.filter((_, k) => k !== i))}
              >✕</button>
            </li>
          ))}
        </ul>
      )}
      <TextInput
        label="영어 문장 (안내문에 표시)"
        placeholder="e.g. Take with a full glass of water."
        value={en}
        onChange={(e) => setEn(e.currentTarget.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
      />
      <TextInput
        label="한국어 (선택 · 한국어 병기용)"
        placeholder="예: 물 한 컵과 함께 드세요."
        value={ko}
        onChange={(e) => setKo(e.currentTarget.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
      />
      <Button variant="light" onClick={add} disabled={!en.trim()}>+ 주의사항 추가</Button>
    </div>
  );
}

export default function InputPanel({ searchRef, customNameRef, ...p }: Props) {
  const { form, drug } = p;
  const route = form.route;
  const prn = form.freq === 'prn';

  const toggleGeneral = (k: GeneralKey, checked: boolean) =>
    p.onForm({ general: checked ? [...form.general, k] : form.general.filter((g) => g !== k) });

  const routeHint = drug
    ? form.route === drug.route
      ? '약 정보에서 자동 선택됨 · 바꿀 수 있습니다'
      : `자동 선택(${ROUTE_LABEL[drug.route]})에서 변경됨`
    : undefined;

  return (
    <section className="panel input-panel" aria-label="복약 정보 입력">
      <div className="step">
        <h2><span className="num">1</span>약 선택</h2>
        <DrugSearch onSelect={p.onSelectDrug} inputRef={searchRef} />

        <SelectedDrugCard drug={drug} onClear={p.onClearDrug} onEnName={p.onEnName} />

        <button type="button" id="customToggle" className="link-btn" onClick={p.onToggleCustom}>
          {p.custom ? '− 직접 입력 취소' : '+ 목록에 없는 약 직접 입력'}
        </button>
        {p.custom && (
          <div id="customFields" className="custom-fields">
            <TextInput
              ref={customNameRef}
              id="customName"
              label="약 이름 (출력 시 그대로 표시)"
              placeholder="예: Cefaclor 250mg"
              value={p.customName}
              onChange={(e) => p.onCustomName(e.currentTarget.value)}
            />
          </div>
        )}
      </div>

      <div className="step">
        <h2><span className="num">2</span>복용 방법</h2>
        <div className="form-grid">
          <Select
            {...sel}
            className="span-2"
            label="사용 경로"
            description={routeHint}
            data={ROUTES}
            value={route}
            onChange={(v) => v && p.onRoute(v as Route)}
          />
          {route !== 'topical' && (
            <div className="qty-field">
              <NumberInput
                label="1회 용량"
                min={0.5}
                step={0.5}
                decimalScale={2}
                value={form.qty}
                onChange={(v) => p.onForm({ qty: String(v) })}
              />
              <Select
                {...sel}
                label="단위"
                data={UNIT_OPTS}
                value={form.unit}
                disabled={route === 'eye'}
                onChange={(v) => v && p.onForm({ unit: v as UnitKey })}
              />
            </div>
          )}
          <Select {...sel} label="1일 횟수" data={FREQS} value={form.freq} onChange={(v) => v && p.onForm({ freq: v })} />
          {route === 'oral' && !prn && (
            <Select
              {...sel}
              label="복용 시점"
              data={TIMING_OPTS}
              value={form.timing}
              onChange={(v) => v && p.onForm({ timing: v as TimingKey })}
            />
          )}
          <Select {...sel} label="기간" data={DAYS} value={form.days} onChange={(v) => p.onForm({ days: v ?? '' })} />
          {route === 'oral' && prn && (
            <Select
              {...sel}
              label="최소 복용 간격"
              data={INTERVALS}
              value={form.interval}
              onChange={(v) => p.onForm({ interval: v ?? '' })}
            />
          )}
          {prn && (
            <Select
              {...sel}
              label="1일 최대 횟수"
              data={MAXES}
              value={form.maxDaily}
              onChange={(v) => p.onForm({ maxDaily: v ?? '' })}
            />
          )}
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
        <NotesInput notes={form.notes} onChange={(notes) => p.onForm({ notes })} />
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
