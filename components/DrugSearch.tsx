'use client';

import { useEffect, useRef, useState } from 'react';
import { searchDrugs } from '@/lib/search';

export default function DrugSearch({
  onSelect,
  inputRef
}: {
  onSelect: (id: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const items = searchDrugs(query);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // 키보드로 이동한 항목이 보이도록 스크롤
  useEffect(() => {
    if (activeIdx < 0) return;
    listRef.current?.querySelectorAll('li[data-id]')[activeIdx]?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const select = (id: string) => {
    setQuery('');
    setOpen(false);
    setActiveIdx(-1);
    onSelect(id);
  };

  const moveActive = (step: number) => {
    if (!items.length) return;
    setActiveIdx((activeIdx + step + items.length) % items.length);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
    else if (e.key === 'Enter') {
      const target = items[activeIdx >= 0 ? activeIdx : 0];
      if (target) { e.preventDefault(); select(target.id); }
    } else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <input
        id="drugSearch"
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder="제품명 또는 성분명 검색 (예: 타이레놀, ibuprofen)"
        aria-controls="drugResults"
        aria-autocomplete="list"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
        onFocus={() => { setOpen(true); setActiveIdx(-1); }}
        onKeyDown={onKeyDown}
      />
      <ul id="drugResults" className="results" role="listbox" hidden={!open} ref={listRef}>
        {items.length ? (
          items.map((d, i) => (
            <li
              key={d.id}
              role="option"
              aria-selected={i === activeIdx}
              data-id={d.id}
              className={i === activeIdx ? 'active' : undefined}
              onMouseDown={(e) => { e.preventDefault(); select(d.id); }}
            >
              <div className="r-main"><strong>{d.brand}</strong><span className="badge">{d.cat}</span></div>
              <div className="r-sub">{d.ing.ko} · {d.ing.en}</div>
            </li>
          ))
        ) : (
          <li className="empty">검색 결과가 없습니다. 아래 “직접 입력”을 이용하세요.</li>
        )}
      </ul>
    </div>
  );
}
