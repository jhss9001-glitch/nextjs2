'use client';

import { Combobox, Loader, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { searchDrugs } from '@/lib/search';
import type { Drug } from '@/lib/types';

interface MfdsResult {
  q: string;
  items: Drug[];
  error?: string;
  warnings?: string[];
}

function DrugOption({ d, value }: { d: Drug; value: string }) {
  return (
    <Combobox.Option value={value} className="drug-option">
      <div className="r-main"><strong>{d.brand}</strong><span className="badge">{d.cat}</span></div>
      <div className="r-sub">
        {d.mfds
          ? [d.mfds.etcOtc, d.mfds.entpName, d.mfds.ingredient].filter(Boolean).join(' · ')
          : `${d.ing.ko} · ${d.ing.en}`}
      </div>
    </Combobox.Option>
  );
}

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

  const local = searchDrugs(query);
  const wantMfds = debounced.length >= 2;
  const loading = wantMfds && mfds.q !== debounced;
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

  // 결과가 바뀌면 첫 항목을 선택 상태로 (Enter로 바로 선택)
  useEffect(() => {
    if (query) combobox.selectFirstOption();
  }, [query, remote?.items.length, combobox]);

  const select = (value: string) => {
    const d = value.startsWith('b:')
      ? local.find((x) => `b:${x.id}` === value)
      : remote?.items.find((x) => `m:${x.id}` === value);
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
          placeholder="제품명 또는 성분명 검색 (예: 타이레놀, 판콜, ibuprofen)"
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); combobox.openDropdown(); }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSection={loading ? <Loader size={16} /> : null}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={380} style={{ overflowY: 'auto' }}>
          {local.length > 0 && (
            <Combobox.Group label={`내장 약품 (영문 안내 검수됨) · ${local.length}`}>
              {local.map((d) => <DrugOption key={d.id} d={d} value={`b:${d.id}`} />)}
            </Combobox.Group>
          )}
          {wantMfds && (
            <Combobox.Group label={`식약처 검색${remote ? ` · ${remote.items.length}` : ''}`}>
              {loading && <Combobox.Empty>식약처에서 검색 중…</Combobox.Empty>}
              {remote?.error && <Combobox.Empty className="search-error">검색 실패: {remote.error}</Combobox.Empty>}
              {remote && !remote.error && !remote.items.length && <Combobox.Empty>식약처 검색 결과가 없습니다.</Combobox.Empty>}
              {remote?.items.map((d) => <DrugOption key={d.id} d={d} value={`m:${d.id}`} />)}
            </Combobox.Group>
          )}
          {!wantMfds && query.trim().length === 1 && <Combobox.Empty>두 글자 이상 입력하면 식약처에서도 검색합니다.</Combobox.Empty>}
          {wantMfds && !local.length && remote && !remote.items.length && (
            <Combobox.Empty>찾는 약이 없으면 아래 “직접 입력”을 이용하세요.</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
