import { UI } from '@/data/rx-data';
import { findDrug } from '@/lib/search';
import { cautions, directions } from '@/lib/sentences';
import type { Item, Lang } from '@/lib/types';

const LOCALE: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' };
export const LANG_NAME = { en: 'English', zh: '中文', ja: '日本語' } as const;
export { LOCALE };

export function today(lang: Lang): string {
  return new Date().toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}

/* 텍스트(복사용) */
export function plainText(list: Item[], lang: Lang, withKo: boolean, pharmacy: string): string {
  const lines: string[] = [];
  lines.push(`[${UI.title[lang]}]`);
  lines.push(`${pharmacy ? `${UI.pharmacy[lang]}: ${pharmacy} / ` : ''}${today(lang)}`);
  list.forEach((it, i) => {
    const d = findDrug(it.drugId);
    lines.push('');
    lines.push(`${i + 1}. ${d ? d.ing[lang] : it.customName}${d ? ` (${d.brandEn})` : ''}`);
    if (d) lines.push(`- ${UI.purpose[lang]}: ${d.use[lang]}`);
    lines.push(`- ${UI.howto[lang]}: ${directions(it, lang).join(' ')}`);
    if (withKo) lines.push(`  (${directions(it, 'ko').join(' ')})`);
    const cs = cautions(it, lang);
    if (cs.length) {
      lines.push(`- ${UI.caution[lang]}:`);
      cs.forEach((c) => lines.push(`  • ${c.t}`));
    }
  });
  lines.push('');
  lines.push(UI.footer[lang]);
  return lines.join('\n');
}
