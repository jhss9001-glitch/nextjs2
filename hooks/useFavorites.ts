'use client';

import { useCallback, useEffect, useState } from 'react';
import { store } from '@/lib/storage';
import type { Tr } from '@/lib/types';

const KEY = 'rx.favNotes';

/** 직접 입력 주의사항 즐겨찾기 (이 브라우저의 localStorage에 저장) */
export function useFavorites() {
  const [favs, setFavs] = useState<Tr[]>([]);

  // 브라우저 저장값은 마운트 후 불러옴 (서버 렌더와 어긋나지 않게)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavs(store.get<Tr[]>(KEY, []));
  }, []);

  const save = useCallback((next: Tr[]) => {
    setFavs(next);
    store.set(KEY, next);
  }, []);

  const add = useCallback(
    (tr: Tr) => {
      const en = tr.en.trim();
      if (!en || favs.some((f) => f.en === en)) return;
      save([...favs, { en, ko: tr.ko.trim() }]);
    },
    [favs, save]
  );

  const remove = useCallback((en: string) => save(favs.filter((f) => f.en !== en)), [favs, save]);

  return { favs, add, remove, has: (en: string) => favs.some((f) => f.en === en) };
}
