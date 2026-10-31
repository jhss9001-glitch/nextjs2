import { DRUGS } from '@/data/rx-data';
import type { Drug } from '@/lib/types';

export const norm = (s: unknown) => String(s || '').toLowerCase().replace(/[\s·\-()/]/g, '');

/** 내장 약품 검색 */
export function searchDrugs(q: string): Drug[] {
  const nq = norm(q);
  if (!nq) return DRUGS;
  return DRUGS.filter((d) => {
    const hay = [d.brand, d.brandEn, d.cat, d.ing.ko, d.ing.en, ...(d.aliases || [])];
    return hay.some((h) => norm(h).includes(nq));
  });
}
