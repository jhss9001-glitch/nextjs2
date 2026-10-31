'use client';

import { useEffect, useRef, useState } from 'react';
import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import InputPanel from '@/components/InputPanel';
import OutputPanel from '@/components/OutputPanel';
import Toast from '@/components/Toast';
import { useSpeech } from '@/hooks/useSpeech';
import { useToast } from '@/hooks/useToast';
import { buildItem, defaultForm, itemToForm, makeForm } from '@/lib/form';
import { plainText } from '@/lib/plain-text';
import { buildScript } from '@/lib/spoken';
import { store } from '@/lib/storage';
import type { Drug, FormState, Item, Route } from '@/lib/types';

export default function RxApp() {
  const [drug, setDrug] = useState<Drug | null>(null);
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [form, setForm] = useState<FormState>(() => defaultForm('oral'));
  const [list, setList] = useState<Item[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showKo, setShowKo] = useState(true);
  const [pharmacy, setPharmacy] = useState('');
  const [framed, setFramed] = useState(false);
  const [clearArmed, setClearArmed] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const customNameRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { message, show, toast } = useToast();
  const { speaking, speakQueue, stop } = useSpeech(toast);

  // 저장된 설정 불러오기 + 프레임 안 여부 확인 (브라우저 전용 값이라 마운트 후 반영)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setShowKo(store.get('rx.showKo', true));
    setPharmacy(store.get('rx.pharmacy', ''));
    // 공유 링크(다른 페이지 안에 삽입된 상태)에서는 인쇄 창을 열 수 없으므로 인쇄 버튼을 숨김
    let inFrame = true;
    try { inFrame = window.self !== window.top; } catch { /* 교차 출처 프레임 */ }
    setFramed(inFrame);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => clearTimeout(clearTimer.current);
  }, []);

  const preview = buildItem(drug, custom, customName, form);

  /* ---------------- 폼 ---------------- */
  const patchForm = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // 사용 경로: 약 선택 시 자동, 이후 사용자가 변경 가능 (점안은 단위 '방울' 고정)
  const changeRoute = (r: Route) => patchForm(r === 'eye' ? { route: r, unit: 'drop' } : { route: r });

  /* ---------------- 약 선택 ---------------- */
  const selectDrug = (d: Drug) => {
    setDrug(d);
    setCustom(false);
    setForm(makeForm(d.def, d.general || [], d.route));
  };

  const clearDrug = () => {
    setDrug(null);
    setForm(defaultForm('oral'));
  };

  const changeEnName = (en: string) => setDrug((d) => (d ? { ...d, ing: { ...d.ing, en } } : d));

  const toggleCustom = () => {
    const next = !custom;
    setCustom(next);
    if (next) {
      setDrug(null);
      setForm(defaultForm('oral'));
      setTimeout(() => customNameRef.current?.focus(), 0);
    }
  };

  /* ---------------- 조제 목록 ---------------- */
  const clearSelection = () => {
    setDrug(null);
    setCustom(false);
    setCustomName('');
    setForm(defaultForm('oral'));
  };

  const endEdit = () => setEditIndex(null);

  const addItem = () => {
    if (!drug && !custom) { toast('먼저 약을 선택하세요.'); searchRef.current?.focus(); return; }
    if (custom && !customName.trim()) { toast('약 이름을 입력하세요.'); customNameRef.current?.focus(); return; }

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
    setEditIndex(i);
    setDrug(it.drug);
    setCustom(!it.drug);
    setCustomName(it.drug ? '' : it.customName);
    setForm(itemToForm(it));
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const changePharmacy = (v: string) => {
    setPharmacy(v);
    store.set('rx.pharmacy', v);
  };

  // [전체 읽어주기]: 스크립트 전체를 읽음
  const speak = () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    if ('speechSynthesis' in window && speechSynthesis.speaking) { stop(); return; }
    speakQueue(buildScript(list, 'en').flatMap((b) => b.lines));
  };

  const copyText = async () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    const text = plainText(list, 'en', showKo, pharmacy.trim());
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
      <AppHeader pharmacy={pharmacy} onPharmacyChange={changePharmacy} />
      <main className="layout">
        <InputPanel
          drug={drug}
          custom={custom}
          customName={customName}
          form={form}
          preview={preview}
          list={list}
          editIndex={editIndex}
          clearArmed={clearArmed}
          searchRef={searchRef}
          customNameRef={customNameRef}
          onSelectDrug={selectDrug}
          onClearDrug={clearDrug}
          onEnName={changeEnName}
          onToggleCustom={toggleCustom}
          onCustomName={setCustomName}
          onRoute={changeRoute}
          onForm={patchForm}
          onAdd={addItem}
          onCancelEdit={cancelEdit}
          onUp={moveUp}
          onEdit={startEdit}
          onDelete={deleteItem}
          onClearAll={clearAll}
        />
        <OutputPanel
          list={list}
          showKo={showKo}
          pharmacy={pharmacy.trim()}
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
