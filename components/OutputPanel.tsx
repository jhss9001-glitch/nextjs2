'use client';

import GuideView from '@/components/GuideView';
import ScriptView from '@/components/ScriptView';
import type { Item, OutLang, TabLang } from '@/lib/types';

const TABS: [TabLang, string][] = [['en', 'English'], ['zh', '中文'], ['ja', '日本語'], ['all', '전체']];
const LANGS: OutLang[] = ['en', 'zh', 'ja'];

export default function OutputPanel({
  list,
  lang,
  showKo,
  pharmacy,
  speaking,
  framed,
  onLang,
  onShowKo,
  onSpeak,
  onCopy,
  onPrint,
  onPlay
}: {
  list: Item[];
  lang: TabLang;
  showKo: boolean;
  pharmacy: string;
  speaking: boolean;
  framed: boolean;
  onLang: (l: TabLang) => void;
  onShowKo: (v: boolean) => void;
  onSpeak: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onPlay: (lang: OutLang, text: string) => void;
}) {
  const langs = lang === 'all' ? LANGS : [lang];
  return (
    <section className="panel output-panel" aria-label="복약지도 출력">
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {TABS.map(([l, label]) => (
            <button key={l} type="button" role="tab" data-lang={l} aria-selected={lang === l} onClick={() => onLang(l)}>
              {label}
            </button>
          ))}
        </div>
        <label className="switch">
          <input id="showKo" type="checkbox" checked={showKo} onChange={(e) => onShowKo(e.target.checked)} />
          <span>한국어 병기</span>
        </label>
      </div>
      <div className="actions">
        <button type="button" id="speakBtn" onClick={onSpeak}>{speaking ? '읽기 중지' : '전체 읽어주기'}</button>
        <button type="button" id="copyBtn" onClick={onCopy}>텍스트 복사</button>
        <button type="button" id="printBtn" hidden={framed} onClick={onPrint}>인쇄</button>
      </div>
      <div id="output" className="output" aria-live="polite">
        {list.length ? (
          langs.map((l) => (
            <div className="lang-group" key={l}>
              <GuideView list={list} lang={l} showKo={showKo} pharmacy={pharmacy} />
              <ScriptView list={list} lang={l} showKo={showKo} onPlay={onPlay} />
            </div>
          ))
        ) : (
          <div className="placeholder">
            <p><strong>왼쪽에서 약을 선택하고 [목록에 추가]를 누르세요.</strong></p>
            <p>추가한 약들이 선택한 언어의 복약 안내문으로 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
