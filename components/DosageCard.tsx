'use client';

import { Button, Loader, NumberInput, Select, type SelectProps } from '@mantine/core';
import { IconAlertTriangle, IconFileText, IconPlus, IconStar, IconStarFilled, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import KoInput, { type TranslateKind } from '@/components/KoInput';
import { GENERAL, TIMINGS, UNITS } from '@/data/rx-data';
import { useFavorites } from '@/hooks/useFavorites';
import { directions, joinDir } from '@/lib/sentences';
import type {
  CustomTexts,
  CycleKey,
  DosageCandidate,
  DosageState,
  Drug,
  FormState,
  GeneralKey,
  Item,
  RouteSel,
  TimingSel,
  Tr,
  UnitSel
} from '@/lib/types';

export const ROUTE_LABEL: Record<Exclude<RouteSel, 'custom' | 'none'>, string> = { oral: '내복', eye: '점안', topical: '외용' };
/** 목록 표시용 경로 이름 (직접 입력이면 입력한 한국어 → 영어) */
export const routeLabel = (it: Pick<Item, 'route' | 'texts'>) =>
  it.route === 'none'
    ? '사용'
    : it.route === 'custom'
      ? it.texts.route.ko.replace(/하세요\.?$/, '') || it.texts.route.en || '기타'
      : ROUTE_LABEL[it.route];

const CUSTOM = '직접 입력…';
// 선택 안 함: 그 항목을 문장에서 빼고 나머지만으로 자연스럽게 이어 붙임
const NONE = '선택 안 함';
const short = (s: string, n = 24) => (s.length > n ? `${s.slice(0, n)}…` : s);
const opt = (value: string | number, label: string) => ({ value: String(value), label });
const ROUTES = [
  opt('oral', '내복 (먹는 약)'), opt('eye', '점안 (안약)'), opt('topical', '외용 (바르는 약)'), opt('none', `${NONE} (“사용하세요”)`), opt('custom', CUSTOM)
];
const UNIT_OPTS = [...Object.entries(UNITS).map(([k, u]) => opt(k, u.label)), opt('none', `${NONE} (용량 빼기)`), opt('custom', CUSTOM)];
const EYE_UNIT_OPTS = [opt('drop', UNITS.drop.label), opt('none', `${NONE} (용량 빼기)`)];
const FREQS = [...[1, 2, 3, 4, 5, 6].map((n) => opt(n, `${n}회`)), opt('prn', '필요시'), opt('none', NONE), opt('custom', CUSTOM)];
const TIMING_OPTS = [...Object.entries(TIMINGS).map(([k, t]) => opt(k, t.label)), opt('none', NONE), opt('custom', CUSTOM)];
// '매일'은 문장에 따로 쓰지 않으므로 선택 안 함과 같음
const CYCLE_LABEL: Record<CycleKey, string> = { '': `매일 / ${NONE}`, alt: '격일', weekly: '주 1회', custom: CUSTOM };
const CYCLES = (Object.keys(CYCLE_LABEL) as CycleKey[]).map((c) => opt(c, CYCLE_LABEL[c]));
const DAY_PRESETS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 28, 30, 60, 90];
const INTERVAL_PRESETS = [4, 6, 8, 12];
const MAX_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8];

/** 후보 한 줄 요약: "1일 1회 · 2정 · 24시간마다" */
function summarize(c: DosageCandidate): string {
  const d = c.def;
  const parts: string[] = [];
  if (d.cycle === 'weekly') parts.push('주 1회');
  else if (d.freq) parts.push(d.freq === 'prn' ? '필요시' : `${d.cycle === 'alt' ? '격일 · ' : ''}1일 ${d.freq}회`);
  else if (d.cycle === 'alt') parts.push('격일');
  if (d.qty) parts.push(`${d.qty}${d.unit ? UNITS[d.unit].label : ''}`);
  if (d.timing && d.timing !== 'none') parts.push(d.timing === 'custom' ? d.timingText?.ko || d.timingText?.en || '' : TIMINGS[d.timing].label);
  if (c.restHint) parts.push('복용 주기 있음');
  if (d.interval) parts.push(`${d.interval}시간 간격`);
  if (d.max) parts.push(`최대 ${d.max}회`);
  return parts.join(' · ');
}

// 공통 주의사항의 짧은 표시 이름 (전체 문장은 마우스를 올리면 보임)
const GENERAL_SHORT: Record<GeneralKey, string> = {
  drowsy: '졸음 주의',
  no_alcohol: '음주 금지',
  complete: '끝까지 복용',
  missed: '복용을 잊었을 때',
  water: '물 충분히',
  swallow: '씹지 말고 삼키기',
  stop_rash: '발진 시 중단',
  consult: '3일 후 진료',
  shake: '흔들어 사용',
  fridge: '냉장 보관',
  room: '실온 보관',
  child: '어린이 손 닿지 않게'
};

// 모든 선택 박스 공통 설정
const sel: Partial<SelectProps> = {
  allowDeselect: false,
  checkIconPosition: 'right',
  comboboxProps: { shadow: 'md', transitionProps: { transition: 'pop', duration: 100 } },
  maxDropdownHeight: 300,
  size: 'sm'
};

/** '직접 입력' 문구 칸: 한국어로 쓰면 영어로 자동 번역 */
function CustomKo({
  kind,
  title,
  value,
  onChange,
  placeholder
}: {
  kind: TranslateKind;
  title: string;
  value: Tr;
  onChange: (v: Tr) => void;
  placeholder: string;
}) {
  return (
    <KoInput
      className="span-all custom-pair"
      kind={kind}
      label={`${title} 직접 입력 (한국어)`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoFocus={!value.ko}
    />
  );
}

/** 숫자 항목(기간·간격·최대): 목록에서 고르거나 '직접 입력'으로 아무 숫자나 */
function NumSelect({
  label,
  className,
  value,
  presets,
  suffix,
  onChange
}: {
  label: string;
  className?: string;
  value: string;
  presets: number[];
  suffix: string;
  onChange: (v: string) => void;
}) {
  const [customFlag, setCustomFlag] = useState(false);
  const [prev, setPrev] = useState(value);
  // 폼이 초기화되어 값이 비면 '직접 입력' 상태도 해제 (렌더 중 파생 상태 갱신)
  if (value !== prev) {
    setPrev(value);
    if (value === '') setCustomFlag(false);
  }
  const isPreset = value === '' || presets.map(String).includes(value);
  const custom = customFlag || !isPreset;
  const data = [opt('', NONE), ...presets.map((n) => opt(n, `${n}${suffix}`)), opt('__custom__', CUSTOM)];

  return (
    <div className={`num-select ${className ?? ''}`}>
      <Select
        {...sel}
        label={label}
        data={data}
        value={custom ? '__custom__' : value}
        onChange={(v) => {
          if (v === '__custom__') setCustomFlag(true);
          else { setCustomFlag(false); onChange(v ?? ''); }
        }}
      />
      {custom && (
        <NumberInput
          size="sm"
          aria-label={`${label} 직접 입력`}
          placeholder="숫자 입력"
          min={1}
          max={9999}
          allowDecimal={false}
          suffix={` ${suffix}`}
          value={value}
          onChange={(v) => onChange(v === '' ? '' : String(v))}
        />
      )}
    </div>
  );
}

/** "용법" 카드: 사용 경로·용량·횟수·시점·기간 + 주의사항 태그 + 직접 입력(즐겨찾기) */
export default function DosageCard({
  drug,
  form,
  preview,
  editing,
  dosage,
  autoFields,
  onApplyCandidate,
  onRoute,
  onForm,
  onAdd,
  onCancelEdit
}: {
  drug: Drug | null;
  form: FormState;
  preview: Item;
  editing: boolean;
  dosage: DosageState;
  autoFields: (keyof FormState)[];
  onApplyCandidate: (c: DosageCandidate, i: number) => void;
  onRoute: (r: RouteSel) => void;
  onForm: (patch: Partial<FormState>) => void;
  onAdd: () => void;
  onCancelEdit: () => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState<Tr>({ ko: '', en: '' }); // 한국어 입력 → 영어 자동 번역
  const fav = useFavorites();

  const route = form.route;
  const prn = form.freq === 'prn';
  const auto = !!drug && form.route === drug.route;
  const takeLike = route === 'oral' || route === 'custom' || route === 'none'; // 복용 시점·최소 간격을 묻는 경로
  const showTiming = takeLike && !prn;
  const noDose = form.unit === 'none';
  // 식약처 정보로 자동 입력된 칸: 연한 초록 + 라벨에 "· 자동"
  const isAuto = (k: keyof FormState) => autoFields.includes(k);
  const af = (k: keyof FormState, label: string) => ({
    label: isAuto(k) ? `${label} · 자동` : label,
    className: isAuto(k) ? 'auto-field' : undefined
  });
  const applied = dosage.selected >= 0 ? dosage.candidates[dosage.selected] : null;
  const setText = (key: keyof CustomTexts) => (v: Tr) => onForm({ texts: { ...form.texts, [key]: v } });

  const toggleGeneral = (k: GeneralKey) =>
    onForm({ general: form.general.includes(k) ? form.general.filter((g) => g !== k) : [...form.general, k] });

  const hasNote = (e: string) => form.notes.some((n) => n.en === e);
  const toggleFavNote = (f: Tr) =>
    onForm({ notes: hasNote(f.en) ? form.notes.filter((n) => n.en !== f.en) : [...form.notes, f] });

  // 번역이 끝난 문구만 추가 (영어 안내문에 들어가야 하므로)
  const noteReady = !!note.ko.trim() && !!note.en.trim();
  const addNote = (alsoFav: boolean) => {
    if (!noteReady) return;
    const n = { en: note.en.trim(), ko: note.ko.trim() };
    if (!hasNote(n.en)) onForm({ notes: [...form.notes, n] });
    if (alsoFav) fav.add(n);
    setNote({ ko: '', en: '' });
  };

  const removeFav = (f: Tr) => {
    if (window.confirm(`즐겨찾기에서 삭제할까요?\n\n${f.ko || f.en}`)) fav.remove(f.en);
  };

  const previewEn = joinDir(directions(preview, 'en'));
  const previewKo = joinDir(directions(preview, 'ko'));
  const extraNotes = form.notes.filter((n) => !fav.has(n.en)); // 즐겨찾기가 아닌 직접 입력 문구

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">용법</div>
        {drug && !auto && route !== 'custom' && route !== 'none' && <span className="card-meta">경로 수동 변경 · 자동값 {ROUTE_LABEL[drug.route]}</span>}
      </div>

      {dosage.status !== 'idle' && (
        <div className="dosage-auto" aria-live="polite">
          {dosage.status === 'loading' && (
            <div className="dosage-status"><Loader size={14} /> 식약처 허가사항 용법용량을 불러오는 중…</div>
          )}
          {dosage.status === 'none' && (
            <div className="dosage-status warn">
              <IconAlertTriangle size={14} /> 식약처 용법용량에서 자동 입력할 내용을 찾지 못했습니다. 직접 선택하세요.
            </div>
          )}
          {dosage.status === 'error' && (
            <div className="dosage-status warn">
              <IconAlertTriangle size={14} /> 용법용량을 불러오지 못했습니다: {dosage.error}
            </div>
          )}
          {dosage.status === 'done' && (
            <>
              <div className="dosage-status">
                <IconFileText size={14} />
                {applied
                  ? <>식약처 {dosage.source} 기반 자동 입력 — <b>반드시 처방과 대조하세요</b></>
                  : <>식약처 용법을 찾았습니다. 직접 바꾼 값이 있어 자동 적용하지 않았습니다 — 아래에서 고르면 적용됩니다.</>}
              </div>
              {applied && <blockquote className="dosage-src">{applied.text}</blockquote>}
              {applied?.restHint && (
                <div className="dosage-rest">
                  <span>원문에 복용 주기(휴약·위약 기간)가 있습니다 — <b>{applied.restHint.ko}</b></span>
                  {hasNote(applied.restHint.en) ? (
                    <span className="label">주의사항에 추가됨</span>
                  ) : (
                    <Button
                      size="compact-xs"
                      variant="light"
                      leftSection={<IconPlus size={12} />}
                      onClick={() => onForm({ notes: [...form.notes, applied.restHint!] })}
                    >
                      직접 입력 주의사항에 추가
                    </Button>
                  )}
                </div>
              )}
              {dosage.candidates.length > 1 || !applied ? (
                <div className="dosage-cands">
                  <span className="label">허가 용법 {dosage.candidates.length}가지</span>
                  {dosage.candidates.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className="cand"
                      aria-pressed={dosage.selected === i}
                      title={c.text}
                      onClick={() => onApplyCandidate(c, i)}
                    >
                      <span className="mono">{i + 1}</span> {summarize(c) || '부분 정보'}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      <div className="card-body dose-grid">
        <Select
          {...sel}
          className={auto ? 'auto-field' : undefined}
          label={auto ? '사용 경로 · 자동' : '사용 경로'}
          data={ROUTES}
          value={route}
          onChange={(v) => v && onRoute(v as RouteSel)}
        />
        {route !== 'topical' && (
          <>
            <NumberInput
              {...af('qty', '1회 용량')}
              min={0.5}
              step={0.5}
              decimalScale={2}
              value={noDose ? '' : form.qty}
              placeholder={noDose ? '—' : undefined}
              disabled={noDose}
              onChange={(v) => onForm({ qty: String(v) })}
            />
            <Select
              {...sel}
              {...af('unit', '단위')}
              data={route === 'eye' ? EYE_UNIT_OPTS : UNIT_OPTS}
              value={form.unit}
              onChange={(v) => v && onForm({ unit: v as UnitSel })}
            />
          </>
        )}
        {route === 'custom' && (
          <CustomKo
            kind="route"
            title="사용 경로"
            value={form.texts.route}
            onChange={setText('route')}
            placeholder="예: 흡입하세요 / 질에 넣으세요 / 혀 밑에 녹이세요"
          />
        )}
        {route !== 'topical' && route !== 'eye' && form.unit === 'custom' && (
          <CustomKo kind="unit" title="단위" value={form.texts.unit} onChange={setText('unit')} placeholder="예: 흡입 / 좌제 / 패치" />
        )}

        {!prn && (
          <Select
            {...sel}
            {...af('cycle', '투여 주기')}
            data={CYCLES}
            value={form.cycle}
            onChange={(v) => onForm({ cycle: (v ?? '') as CycleKey })}
          />
        )}
        {/* 주 1회는 "once a week"로 안내하므로 1일 횟수를 묻지 않음 */}
        {(prn || form.cycle !== 'weekly') && (
          <Select {...sel} {...af('freq', '1일 횟수')} data={FREQS} value={form.freq} onChange={(v) => v && onForm({ freq: v })} />
        )}
        {showTiming && (
          <Select
            {...sel}
            {...af('timing', '복용 시점')}
            data={TIMING_OPTS}
            value={form.timing}
            onChange={(v) => v && onForm({ timing: v as TimingSel })}
          />
        )}
        <NumSelect label="기간" value={form.days} presets={DAY_PRESETS} suffix="일" onChange={(v) => onForm({ days: v })} />
        {takeLike && prn && (
          <NumSelect
            {...af('interval', '최소 간격')}
            value={form.interval}
            presets={INTERVAL_PRESETS}
            suffix="시간"
            onChange={(v) => onForm({ interval: v })}
          />
        )}
        {prn && (
          <NumSelect
            {...af('maxDaily', '1일 최대')}
            value={form.maxDaily}
            presets={MAX_PRESETS}
            suffix="회"
            onChange={(v) => onForm({ maxDaily: v })}
          />
        )}

        {form.freq === 'custom' && form.cycle !== 'weekly' && (
          <CustomKo kind="freq" title="1일 횟수" value={form.texts.freq} onChange={setText('freq')} placeholder="예: 1일 3~4회 / 아침저녁으로" />
        )}
        {showTiming && form.timing === 'custom' && (
          <CustomKo kind="timing" title="복용 시점" value={form.texts.timing} onChange={setText('timing')} placeholder="예: 양치 후에 / 아침 식사 1시간 전에" />
        )}
        {!prn && form.cycle === 'custom' && (
          <CustomKo
            kind="cycle"
            title="투여 주기"
            value={form.texts.cycle}
            onChange={setText('cycle')}
            placeholder="예: 평일에만 복용하고 주말에는 쉬세요."
          />
        )}
      </div>

      <div className="tags" aria-label="추가 주의사항">
        {(Object.keys(GENERAL) as GeneralKey[]).map((g) => (
          <button
            key={g}
            type="button"
            className="tag"
            aria-pressed={form.general.includes(g)}
            title={GENERAL[g].ko}
            onClick={() => toggleGeneral(g)}
          >
            {GENERAL_SHORT[g]}
          </button>
        ))}

        {/* 즐겨찾기: 누르면 주의사항에 넣고/빼기 */}
        {fav.favs.map((f) => (
          <span key={f.en} className="tag tag-fav" data-on={hasNote(f.en)}>
            <button type="button" className="tag-main" title={f.en} aria-pressed={hasNote(f.en)} onClick={() => toggleFavNote(f)}>
              <IconStarFilled size={11} /> {short(f.ko || f.en)}
            </button>
            <button type="button" aria-label="즐겨찾기 삭제" title="즐겨찾기 삭제" onClick={() => removeFav(f)}>
              <IconX size={12} />
            </button>
          </span>
        ))}

        {/* 이번 약에만 직접 입력한 문구: ★로 즐겨찾기 저장 가능 */}
        {extraNotes.map((n) => (
          <span key={n.en} className="tag tag-note" title={n.en}>
            {short(n.ko || n.en)}
            <button type="button" aria-label="즐겨찾기에 저장" title="즐겨찾기에 저장" onClick={() => fav.add(n)}>
              <IconStar size={12} />
            </button>
            <button
              type="button"
              aria-label="직접 입력한 주의사항 삭제"
              onClick={() => onForm({ notes: form.notes.filter((x) => x.en !== n.en) })}
            >
              <IconX size={12} />
            </button>
          </span>
        ))}
        <button type="button" className="tag tag-add" aria-expanded={noteOpen} onClick={() => setNoteOpen(!noteOpen)}>
          <IconPlus size={12} /> 직접 입력
        </button>
      </div>

      {noteOpen && (
        <div className="note-form">
          <KoInput
            kind="note"
            label="주의사항 (한국어로 입력하면 영어로 번역됩니다)"
            placeholder="예: 물 한 컵과 함께 드세요."
            value={note}
            onChange={setNote}
            onEnter={() => addNote(false)}
            autoFocus
          />
          <div className="note-actions">
            <Button size="xs" variant="light" onClick={() => addNote(false)} disabled={!noteReady}>추가</Button>
            <Button size="xs" variant="default" leftSection={<IconStar size={12} />} onClick={() => addNote(true)} disabled={!noteReady}>
              추가 + 즐겨찾기
            </Button>
          </div>
        </div>
      )}

      <div className="card-foot">
        <div className="preview" id="previewKo">
          <div className="preview-en" lang="en">{previewEn}</div>
          <div className="preview-ko">{previewKo}</div>
        </div>
        <div className="foot-actions">
          {editing && <Button variant="default" onClick={onCancelEdit}>수정 취소</Button>}
          <Button id="addBtn" onClick={onAdd}>{editing ? '수정 완료' : '목록에 추가'}</Button>
        </div>
      </div>
    </div>
  );
}
