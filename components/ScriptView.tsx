import { LANG_NAME } from '@/lib/plain-text';
import { buildScript } from '@/lib/spoken';
import type { Item, OutLang } from '@/lib/types';

export default function ScriptView({
  list,
  lang,
  showKo,
  onPlay
}: {
  list: Item[];
  lang: OutLang;
  showKo: boolean;
  onPlay: (lang: OutLang, text: string) => void;
}) {
  const blocks = buildScript(list, lang);
  const blocksKo = buildScript(list, 'ko');
  return (
    <section className="script" lang={lang} aria-label="복약지도 스크립트">
      <header className="s-head">
        <h3>복약지도 스크립트 <span className="badge">{LANG_NAME[lang]}</span></h3>
        <p>환자에게 그대로 읽어 주세요. ▶ 버튼을 누르면 해당 문장을 음성으로 들려줍니다.</p>
      </header>
      {blocks.map((b, bi) => (
        <div className="s-block" key={bi}>
          <div className="s-label">{b.label}</div>
          {b.lines.map((t, li) => (
            <p className="s-line" key={li}>
              <button type="button" className="play" aria-label="이 문장 듣기" onClick={() => onPlay(lang, t)}>▶</button>
              <span className="s-text">
                {t}
                {showKo && <span className="ko" lang="ko">{blocksKo[bi].lines[li]}</span>}
              </span>
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
