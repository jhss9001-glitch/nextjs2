'use client';

import { useEffect, useRef, useState } from 'react';
import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import InputPanel from '@/components/InputPanel';
import OutputPanel from '@/components/OutputPanel';
import Toast from '@/components/Toast';
import { useSpeech } from '@/hooks/useSpeech';
import { useToast } from '@/hooks/useToast';
import { buildItem, currentRoute, defaultForm, makeForm } from '@/lib/form';
import { plainText } from '@/lib/plain-text';
import { findDrug } from '@/lib/search';
import { buildScript } from '@/lib/spoken';
import { store } from '@/lib/storage';
import type { FormState, Item, OutLang, Route, TabLang } from '@/lib/types';

const LANGS: OutLang[] = ['en', 'zh', 'ja'];

export default function RxApp() {
  const [drug, setDrug] = useState<ReturnType<typeof findDrug>>(null);
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRoute, setCustomRoute] = useState<Route>('oral');
  const [form, setForm] = useState<FormState>(() => defaultForm('oral'));
  const [list, setList] = useState<Item[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<TabLang>('en');
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
    setLang(store.get<TabLang>('rx.lang', 'en'));
    setShowKo(store.get('rx.showKo', true));
    setPharmacy(store.get('rx.pharmacy', ''));
    // 공유 링크(다른 페이지 안에 삽입된 상태)에서는 인쇄 창을 열 수 없으므로 인쇄 버튼을 숨김
    let inFrame = true;
    try { inFrame = window.self !== window.top; } catch { /* 교차 출처 프레임 */ }
    setFramed(inFrame);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => clearTimeout(clearTimer.current);
  }, []);

  const route = currentRoute(drug, custom, customRoute);
  const preview = buildItem(drug, custom, customName, customRoute, form);

  /* ---------------- 폼 ---------------- */
  const patchForm = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const resetForm = (r: Route) => setForm(defaultForm(r));

  /* ---------------- 약 선택 ---------------- */
  const selectDrug = (id: string) => {
    const d = findDrug(id);
    if (!d) return;
    setDrug(d);
    setCustom(false);
    setForm(makeForm(d.def, d.general || [], d.route));
  };

  const clearDrug = () => {
    setDrug(null);
    resetForm(custom ? customRoute : 'oral');
  };

  const toggleCustom = () => {
    const next = !custom;
    setCustom(next);
    if (next) {
      setDrug(null);
      resetForm(customRoute);
      setTimeout(() => customNameRef.current?.focus(), 0);
    }
  };

  const changeCustomRoute = (r: Route) => {
    setCustomRoute(r);
    if (r === 'eye') patchForm({ unit: 'drop' });
  };

  const changeForm = (patch: Partial<FormState>) => patchForm(patch);

  /* ---------------- 조제 목록 ---------------- */
  const clearSelection = () => {
    setDrug(null);
    setCustom(false);
    setCustomName('');
    resetForm('oral');
  };

  const endEdit = () => setEditIndex(null);

  const addItem = () => {
    if (!drug && !custom) { toast('먼저 약을 선택하세요.'); searchRef.current?.focus(); return; }
    if (custom && !customName.trim()) { toast('약 이름을 입력하세요.'); customNameRef.current?.focus(); return; }

    const it = buildItem(drug, custom, customName, customRoute, form);
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
    if (it.drugId) {
      setDrug(findDrug(it.drugId));
      setCustom(false);
    } else {
      setDrug(null);
      setCustom(true);
      setCustomName(it.customName);
      setCustomRoute(it.route);
    }
    setForm({
      unit: it.route === 'eye' ? 'drop' : it.unit,
      qty: String(it.qty || 1),
      freq: it.freq,
      timing: it.timing,
      days: String(it.days ?? ''),
      interval: String(it.interval ?? ''),
      maxDaily: String(it.max ?? ''),
      general: it.general
    });
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
  const changeLang = (l: TabLang) => {
    setLang(l);
    store.set('rx.lang', l);
    stop();
  };

  const changeShowKo = (v: boolean) => {
    setShowKo(v);
    store.set('rx.showKo', v);
  };

  const changePharmacy = (v: string) => {
    setPharmacy(v);
    store.set('rx.pharmacy', v);
  };

  const outLangs = (): OutLang[] => (lang === 'all' ? LANGS : [lang]);

  // [전체 읽어주기]: 선택한 언어의 스크립트 전체를 읽음
  const speak = () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    if ('speechSynthesis' in window && speechSynthesis.speaking) { stop(); return; }
    const parts = outLangs().flatMap((l) =>
      buildScript(list, l).flatMap((b) => b.lines.map((text) => ({ lang: l, text })))
    );
    speakQueue(parts);
  };

  const copyText = async () => {
    if (!list.length) { toast('먼저 약을 목록에 추가하세요.'); return; }
    const text = outLangs().map((l) => plainText(list, l, showKo, pharmacy.trim())).join('\n\n--------------------\n\n');
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
          customRoute={customRoute}
          route={route}
          form={form}
          preview={preview}
          list={list}
          editIndex={editIndex}
          clearArmed={clearArmed}
          searchRef={searchRef}
          customNameRef={customNameRef}
          onSelectDrug={selectDrug}
          onClearDrug={clearDrug}
          onToggleCustom={toggleCustom}
          onCustomName={setCustomName}
          onCustomRoute={changeCustomRoute}
          onForm={changeForm}
          onAdd={addItem}
          onCancelEdit={cancelEdit}
          onUp={moveUp}
          onEdit={startEdit}
          onDelete={deleteItem}
          onClearAll={clearAll}
        />
        <OutputPanel
          list={list}
          lang={lang}
          showKo={showKo}
          pharmacy={pharmacy.trim()}
          speaking={speaking}
          framed={framed}
          onLang={changeLang}
          onShowKo={changeShowKo}
          onSpeak={speak}
          onCopy={copyText}
          onPrint={print}
          onPlay={(l, text) => speakQueue([{ lang: l, text }])}
        />
      </main>
      <AppFooter />
      <Toast message={message} show={show} />
    </>
  );
}
