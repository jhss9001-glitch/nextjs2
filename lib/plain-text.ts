import { UI } from '@/data/rx-data';
import { cautions, directions, infoOf, itemName, joinDir } from '@/lib/sentences';
import type { Item, Lang } from '@/lib/types';

export const LOCALE: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US' };

export function today(lang: Lang): string {
  return new Date().toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}

/* 텍스트(복사용) */
export function plainText(list: Item[], lang: Lang, withKo: boolean, pharmacy: string): string {
  const lines: string[] = [];
  lines.push(`[${UI.title[lang]}]`);
  lines.push(`${pharmacy ? `${UI.pharmacy[lang]}: ${pharmacy} / ` : ''}${today(lang)}`);
  list.forEach((it, i) => {
    const d = it.drug;
    const info = infoOf(it);
    lines.push('');
    lines.push(`${i + 1}. ${itemName(it, lang)}${d?.brandEn ? ` (${d.brandEn})` : ''}`);
    if (info.purpose) {
      lines.push(`- ${UI.purpose[lang]}: ${info.purpose[lang]}`);
      if (withKo && info.purpose.ko) lines.push(`  (${info.purpose.ko})`);
    }
    lines.push(`- ${UI.howto[lang]}: ${joinDir(directions(it, lang))}`);
    if (withKo) lines.push(`  (${joinDir(directions(it, 'ko'))})`);
    if (info.sideEffects.length || info.serious) {
      lines.push(`- ${UI.sideEffects[lang]}:`);
      info.sideEffects.forEach((s) => lines.push(`  • ${s[lang]}`));
      if (info.serious) lines.push(`  ! ${info.serious[lang]}`);
    }
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
