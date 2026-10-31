'use client';

import { Combobox, Loader, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { Drug } from '@/lib/types';

interface MfdsResult {
  q: string;
  items: Drug[];
  error?: string;
  warnings?: string[];
}

/** 식약처 의약품 검색 (제품명) */
export default function DrugSearch({
  onSelect,
  inputRef
}: {
  onSelect: (d: Drug) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState('');
  const [debounced] = useDebouncedValue(query.trim(), 350);
  const [mfds, setMfds] = useState<MfdsResult>({ q: '', items: [] });
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  const typed = query.trim();
  const wantMfds = debounced.length >= 2;
  const loading = typed.length >= 2 && mfds.q !== typed;
  const remote = wantMfds && mfds.q === debounced ? mfds : null;

  // 식약처 검색 (디바운스, 이전 요청 취소)
  useEffect(() => {
    if (debounced.length < 2) return;
    const ctrl = new AbortController();
    fetch(`/api/drugs/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setMfds({ q: debounced, items: j.items ?? [], error: j.error, warnings: j.warnings }))
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setMfds({ q: debounced, items: [], error: e.message });
      });
    return () => ctrl.abort();
  }, [debounced]);

  // Ctrl+K (Mac: ⌘K) 로 검색창 이동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputRef]);

  // 결과가 바뀌면 첫 항목을 선택 상태로 (Enter로 바로 선택)
  useEffect(() => {
    if (remote?.items.length) combobox.selectFirstOption();
  }, [remote?.items.length, combobox]);

  const select = (value: string) => {
    const d = remote?.items.find((x) => x.id === value);
    if (!d) return;
    setQuery('');
    combobox.closeDropdown();
    onSelect(d);
  };

  return (
    <Combobox store={combobox} onOptionSubmit={select}>
      <Combobox.Target>
        <TextInput
          ref={inputRef}
          id="drugSearch"
          type="search"
          autoComplete="off"
          aria-label="식약처 의약품 검색"
          placeholder="식약처 의약품 검색 — 제품명, 성분명 (예: 타이레놀, 아목시실린)"
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); combobox.openDropdown(); }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          leftSection={<IconSearch size={16} stroke={2} />}
          rightSection={loading ? <Loader size={14} color="gray" /> : <kbd className="kbd">Ctrl K</kbd>}
          rightSectionWidth={64}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={!typed}>
        <Combobox.Options mah={380} style={{ overflowY: 'auto' }}>
          {typed.length < 2 && <Combobox.Empty>두 글자 이상 입력하면 식약처에서 검색합니다.</Combobox.Empty>}
          {typed.length >= 2 && loading && <Combobox.Empty>식약처에서 검색 중…</Combobox.Empty>}
          {!loading && remote?.error && (
            <Combobox.Empty className="search-error">검색 실패: {remote.error}</Combobox.Empty>
          )}
          {!loading && remote && !remote.error && !remote.items.length && (
            <Combobox.Empty>검색 결과가 없습니다. 아래 “직접 입력”을 이용하세요.</Combobox.Empty>
          )}
          {!loading && remote && remote.items.length > 0 && (
            <Combobox.Group label={`식약처 검색 결과 · ${remote.items.length}건`}>
              {remote.items.map((d) => (
                <Combobox.Option key={d.id} value={d.id} className="drug-option">
                  <div className="r-main"><strong>{d.brand}</strong><span className="badge">{d.cat}</span></div>
                  <div className="r-sub">
                    {[d.mfds?.etcOtc, d.mfds?.entpName, d.mfds?.ingredient].filter(Boolean).join(' · ')}
                  </div>
                </Combobox.Option>
              ))}
            </Combobox.Group>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
