'use client';

import { useEffect, useRef, useState } from 'react';
import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import DosageCard from '@/components/DosageCard';
import DrugSearch from '@/components/DrugSearch';
import OutputPanel from '@/components/OutputPanel';
import RxList from '@/components/RxList';
import SelectedDrugCard from '@/components/SelectedDrugCard';
import Toast from '@/components/Toast';
import { useSpeech } from '@/hooks/useSpeech';
import { useToast } from '@/hooks/useToast';
import { parseDosage } from '@/lib/dosage-parse';
import { applyCandidate, buildItem, defaultForm, itemToForm, makeForm, missingCustom, missingInfo } from '@/lib/form';
import PatientInfoCard, { type InfoState } from '@/components/PatientInfoCard';
import { plainText } from '@/lib/plain-text';
import { koProductName } from '@/lib/sentences';
import { buildScript } from '@/lib/spoken';
import { store } from '@/lib/storage';
import {
  emptyTr,
  type DosageCandidate,
  type DosageState,
  type Drug,
  type FormState,
  type Item,
  type PatientInfo,
  type RouteSel,
  type Tr
} from '@/lib/types';

interface InfoLine { ko: string; en: string; back: string }
interface InfoResponse {
  purpose?: InfoLine | null;
  sideEffects?: InfoLine[];
  serious?: InfoLine | null;
  source?: string;
  error?: string;
}

const IDLE: DosageState = { status: 'idle', candidates: [], selected: -1 };

export default function RxApp() {
  const [drug, setDrug] = useState<Drug | null>(null);
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState<Tr>(emptyTr); // 직접 입력한 약 이름 (ko → en 자동 번역)
  const [form, setForm] = useState<FormState>(() => defaultForm('oral'));
  const [list, setList] = useState<Item[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showKo, setShowKo] = useState(true);
  const [pharmacy, setPharmacy] = useState<Tr>(emptyTr); // 약국명 (ko → en 자동 번역)
  const [framed, setFramed] = useState(false);
  const [clearArmed, setClearArmed] = useState(false);
  // 식약처 용법 자동 입력: 상태 + 자동으로 채운 칸 (사용자가 바꾸면 표시에서 빠짐)
  const [dosage, setDosage] = useState<DosageState>(IDLE);
  const [autoFields, setAutoFields] = useState<(keyof FormState)[]>([]);
  const [nameStatus, setNameStatus] = useState<'idle' | 'loading' | 'error'>('idle'); // 영문명 자동 번역 상태
  // 환자 설명(무슨 약·부작용) 자동 요약 상태
  const [infoState, setInfoState] = useState<InfoState>({ status: 'idle' });
  const [backs, setBacks] = useState<Record<string, string>>({}); // 자동 요약 영어 → 역번역
  const infoReq = useRef(0);
  const infoTouched = useRef(false); // 약사가 환자 설명을 직접 고쳤는지
  const touched = useRef(false); // 약 선택 후 사용자가 용법을 직접 바꿨는지
  const detailReq = useRef(0); // 늦게 도착한 상세 응답 무시용

  const searchRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { message, show, toast } = useToast();
  const { speaking, speakQueue, stop } = useSpeech(toast);

  // 저장된 설정 불러오기 + 프레임 안 여부 확인 (브라우저 전용 값이라 마운트 후 반영)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setShowKo(store.get('rx.showKo', true));
    setPharmacy({ ko: store.get('rx.pharmacy', ''), en: store.get('rx.pharmacyEn', '') });
    // 공유 링크(다른 페이지 안에 삽입된 상태)에서는 인쇄 창을 열 수 없으므로 인쇄 버튼을 숨김
    let inFrame = true;
    try { inFrame = window.self !== window.top; } catch { /* 교차 출처 프레임 */ }
    setFramed(inFrame);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => clearTimeout(clearTimer.current);
  }, []);

  const preview = buildItem(drug, custom, customName, form);

  /* ---------------- 폼 ---------------- */
  // 사용자가 직접 바꾼 값: 자동 표시에서 빼고, 늦게 온 식약처 용법이 덮어쓰지 않게 함
  const patchForm = (patch: Partial<FormState>) => {
    touched.current = true;
    setAutoFields((a) => a.filter((k) => !(k in patch)));
    setForm((f) => ({ ...f, ...patch }));
  };

  // 사용 경로: 약 선택 시 자동, 이후 사용자가 변경 가능 (점안은 단위 '방울' 고정)
  const changeRoute = (r: RouteSel) => patchForm(r === 'eye' ? { route: r, unit: 'drop' } : { route: r });

  const resetInfo = () => {
    infoReq.current++;
    infoTouched.current = false;
    setInfoState({ status: 'idle' });
  };

  /** 식약처 효능·부작용 → 환자 설명 초안 (Gemini 요약·번역) */
  const loadInfo = (d: Drug) => {
    if (!d.mfds) return;
    const req = ++infoReq.current;
    infoTouched.current = false;
    setInfoState({ status: 'loading' });
    fetch('/api/drugs/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemSeq: d.mfds.itemSeq, efcy: d.mfds.efcy, se: d.mfds.se })
    })
      .then((r) => r.json())
      .then((j: InfoResponse) => {
        if (infoReq.current !== req) return; // 그 사이 다른 약을 선택함
        if (j.error) { setInfoState({ status: 'error', error: j.error }); return; }
        const tr = (l: InfoLine | null): Tr => (l ? { ko: l.ko, en: l.en } : emptyTr());
        const lines = [j.purpose, ...(j.sideEffects ?? []), j.serious].filter(Boolean) as InfoLine[];
        setBacks((b) => ({ ...b, ...Object.fromEntries(lines.filter((l) => l.back).map((l) => [l.en, l.back])) }));
        setInfoState({ status: 'done', source: j.source });
        // 약사가 이미 직접 고쳤으면 덮어쓰지 않음
        if (!infoTouched.current) {
          setForm((f) => ({
            ...f,
            info: { purpose: tr(j.purpose ?? null), sideEffects: (j.sideEffects ?? []).map(tr), serious: tr(j.serious ?? null) }
          }));
        }
      })
      .catch((e: Error) => {
        if (infoReq.current === req) setInfoState({ status: 'error', error: e.message });
      });
  };

  const changeInfo = (info: PatientInfo) => {
    infoTouched.current = true;
    setForm((f) => ({ ...f, info }));
  };

  const resetDosage = () => {
    detailReq.current++;
    touched.current = false;
    setDosage(IDLE);
    setAutoFields([]);
  };

  /** 후보 i를 폼에 적용 */
  const applyDosage = (c: DosageCandidate, i: number, base?: FormState) => {
    setForm((f) => applyCandidate(base ?? f, c));
    setAutoFields(['route', ...c.fields]);
    setDosage((s) => ({ ...s, selected: i }));
  };

  /* ---------------- 약 선택 ---------------- */
  const selectDrug = (d: Drug) => {
    resetDosage();
    resetInfo();
    setDrug(d);
    setCustom(false);
    const base = makeForm(d.def, d.general || [], d.route);
    setForm(base);
    setAutoFields(['route']);
    if (!d.mfds) return;
    loadInfo(d);

    // 0) 식약처에 영문명이 없으면 한글 제품명을 영어 이름으로 자동 번역 (영어 안내문에 한글이 섞이지 않게)
    if (!d.ing.en) {
      const id = d.id;
      setNameStatus('loading');
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'name', ko: koProductName(d.brand) })
      })
        .then((r) => r.json())
        .then((j: { en?: string; error?: string }) => {
          setNameStatus(j.en ? 'idle' : 'error');
          // 그 사이 다른 약을 골랐거나 약사가 영문명을 직접 썼으면 덮어쓰지 않음
          if (j.en) setDrug((cur) => (cur?.id === id && !cur.ing.en ? { ...cur, ing: { ...cur.ing, en: j.en! } } : cur));
        })
        .catch(() => setNameStatus('error'));
    }

    // 1) 일반의약품: e약은요 "사용법"으로 바로 추정
    const easy = parseDosage(d.mfds.useMethod ?? '', { itemName: d.brand, category: d.cat });
    if (easy.length) {
      setDosage({ status: 'done', source: 'e약은요 사용법', candidates: easy, selected: 0 });
      applyDosage(easy[0], 0, base);
      return;
    }

    // 2) 전문의약품 등: 허가사항 용법용량을 서버에서 불러와 추정 (느릴 수 있음)
    const req = detailReq.current;
    const itemSeq = d.mfds.itemSeq;
    setDosage({ status: 'loading', candidates: [], selected: -1 });
    fetch(`/api/drugs/detail?itemSeq=${encodeURIComponent(itemSeq)}&cat=${encodeURIComponent(d.cat)}`)
      .then((r) => r.json())
      .then((j: { ud?: string; ee?: string; candidates?: DosageCandidate[]; error?: string }) => {
        if (detailReq.current !== req) return; // 그 사이 다른 약을 선택함
        if (j.error) { setDosage({ status: 'error', candidates: [], selected: -1, error: j.error }); return; }
        // 카드의 식약처 원문에 용법용량·효능 추가
        setDrug((cur) =>
          cur?.mfds?.itemSeq === itemSeq
            ? { ...cur, mfds: { ...cur.mfds, ud: j.ud || undefined, efcy: cur.mfds.efcy || j.ee || undefined } }
            : cur
        );
        const cands = j.candidates ?? [];
        if (!cands.length) { setDosage({ status: 'none', source: '허가사항 용법용량', candidates: [], selected: -1 }); return; }
        setDosage({ status: 'done', source: '허가사항 용법용량', candidates: cands, selected: -1 });
        // 사용자가 아직 용법을 건드리지 않았을 때만 자동 적용
        if (!touched.current) applyDosage(cands[0], 0);
      })
      .catch((e: Error) => {
        if (detailReq.current === req) setDosage({ status: 'error', candidates: [], selected: -1, error: e.message });
      });
  };

  const clearDrug = () => {
    resetDosage();
    resetInfo();
    setDrug(null);
    setForm(defaultForm('oral'));
  };

  const changeEnName = (en: string) => setDrug((d) => (d ? { ...d, ing: { ...d.ing, en } } : d));

  const toggleCustom = () => {
    const next = !custom;
    setCustom(next);
    if (next) {
      resetDosage();
      resetInfo();
      setDrug(null);
      setForm(defaultForm('oral'));
    }
  };

  /* ---------------- 조제 목록 ---------------- */
  const clearSelection = () => {
    resetDosage();
    resetInfo();
    setDrug(null);
    setCustom(false);
    setCustomName(emptyTr());
    setForm(defaultForm('oral'));
  };

  const endEdit = () => setEditIndex(null);

  const addItem = () => {
    if (!drug && !custom) { toast('먼저 약을 선택하세요.'); searchRef.current?.focus(); return; }
    if (custom && !customName.ko.trim()) { toast('약 이름을 입력하세요.'); return; }
    // 직접 입력한 한국어는 영어 번역이 끝나야 안내문에 쓸 수 있음
    const missing = [...(custom && !customName.en.trim() ? ['약 이름'] : []), ...missingCustom(form), ...missingInfo(form.info)];
    if (missing.length) { toast(`${missing.join(', ')}: 한국어를 입력하고 영어 번역이 끝날 때까지 기다려 주세요.`); return; }

    const it = buildItem(drug, custom, customName, form);
    if (editIndex !== null) {
      setList((l) => l.map((x, i) => (i === editIndex ? it : x)));
      toast('수정되었습니다.');
    } else {
      setList((l) => [...l, it]);
      toast('목록에 추가되었습니다.');
    }
    endEdit();
    clearSelection();
  };

  const startEdit = (i: number) => {
    const it = list[i];
    resetDosage();
    resetInfo();
    setEditIndex(i);
    setDrug(it.drug);
    setCustom(!it.drug);
    setCustomName(it.drug ? emptyTr() : { ...it.customName });
    setForm(itemToForm(it));
    document.getElementById('selectedDrug')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => { endEdit(); clearSelection(); };

  const deleteItem = (i: number) => {
    setList((l) => l.filter((_, k) => k !== i));
    if (editIndex === i) { endEdit(); clearSelection(); }
    else if (editIndex !== null && editIndex > i) setEditIndex(editIndex - 1);
  };

  const moveUp = (i: number) => {
    if (i <= 0) return;
    setList((l) => { const n = [...l]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; });
    if (editIndex === i) setEditIndex(i - 1);
    else if (editIndex === i - 1) setEditIndex(i);
  };

  // 실수 방지: 한 번 누르면 확인 상태, 3초 안에 다시 누르면 비움
  const clearAll = () => {
    if (!list.length) return;
    if (!clearArmed) {
      setClearArmed(true);
      clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setClearArmed(false), 3000);
      return;
    }
    clearTimeout(clearTimer.current);
    setClearArmed(false);
    setList([]);
    endEdit();
    clearSelection();
  };

  /* ---------------- 출력 ---------------- */
  const changeShowKo = (v: boolean) => {
    setShowKo(v);
    store.set('rx.showKo', v);
  };

  const changePharmacy = (v: Tr) => {
    setPharmacy(v);
    store.set('rx.pharmacy', v.ko);
    store.set('rx.pharmacyEn', v.en);
  };
  // 안내문의 약국명: 번역된 영어 (번역 전이면 한국어 그대로)
  const pharmacyEn = (pharmacy.en || pharmacy.ko).trim();

  // [전체 읽어주기]: 스크립트 전체를 읽음
  const speak = () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    if ('speechSynthesis' in window && speechSynthesis.speaking) { stop(); return; }
    speakQueue(buildScript(list, 'en').flatMap((b) => b.lines));
  };

  const copyText = async () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    const text = plainText(list, 'en', showKo, pharmacyEn);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* 무시 */ }
      ta.remove();
    }
    toast('클립보드에 복사되었습니다.');
  };

  const print = () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    window.print();
  };

  return (
    <>
      <AppHeader
        pharmacy={pharmacy}
        onPharmacyChange={changePharmacy}
        search={<DrugSearch onSelect={selectDrug} inputRef={searchRef} />}
      />
      <main className="workspace">
        <section className="col col-input" aria-label="조제 입력">
          <SelectedDrugCard
            drug={drug}
            custom={custom}
            customName={customName}
            nameStatus={nameStatus}
            onClear={clearDrug}
            onEnName={changeEnName}
            onToggleCustom={toggleCustom}
            onCustomName={setCustomName}
          />
          {(drug || custom) && (
            <PatientInfoCard
              info={form.info}
              state={infoState}
              backs={backs}
              hasDrug={!!drug?.mfds}
              onChange={changeInfo}
              onRetry={() => drug && loadInfo(drug)}
            />
          )}
          <DosageCard
            drug={drug}
            form={form}
            preview={preview}
            editing={editIndex !== null}
            dosage={dosage}
            autoFields={autoFields}
            onApplyCandidate={(c, i) => applyDosage(c, i)}
            onRoute={changeRoute}
            onForm={patchForm}
            onAdd={addItem}
            onCancelEdit={cancelEdit}
          />
          <RxList
            list={list}
            editIndex={editIndex}
            clearArmed={clearArmed}
            onUp={moveUp}
            onEdit={startEdit}
            onDelete={deleteItem}
            onClear={clearAll}
          />
        </section>
        <OutputPanel
          list={list}
          showKo={showKo}
          pharmacy={pharmacyEn}
          speaking={speaking}
          framed={framed}
          onShowKo={changeShowKo}
          onSpeak={speak}
          onCopy={copyText}
          onPrint={print}
          onPlay={(text) => speakQueue([text])}
        />
      </main>
      <AppFooter />
      <Toast message={message} show={show} />
    </>
  );
}
