import { DRUGS } from '@/data/rx-data';
import type { Drug } from '@/lib/types';

export const norm = (s: unknown) => String(s || '').toLowerCase().replace(/[\s·\-()/]/g, '');

export function searchDrugs(q: string): Drug[] {
  const nq = norm(q);
  if (!nq) return DRUGS;
  return DRUGS.filter((d) => {
    const hay = [d.brand, d.brandEn, d.cat, d.ing.ko, d.ing.en, d.ing.zh, d.ing.ja, ...(d.aliases || [])];
    return hay.some((h) => norm(h).includes(nq));
  });
}

export const findDrug = (id: string | null): Drug | null =>
  id ? DRUGS.find((x) => x.id === id) ?? null : null;
