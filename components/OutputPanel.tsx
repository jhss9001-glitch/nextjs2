'use client';

import GuideView from '@/components/GuideView';
import ScriptView from '@/components/ScriptView';
import type { Item } from '@/lib/types';

export default function OutputPanel({
  list,
  showKo,
  pharmacy,
  speaking,
  framed,
  onShowKo,
  onSpeak,
  onCopy,
  onPrint,
  onPlay
}: {
  list: Item[];
  showKo: boolean;
  pharmacy: string;
  speaking: boolean;
  framed: boolean;
  onShowKo: (v: boolean) => void;
  onSpeak: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onPlay: (text: string) => void;
}) {
  return (
    <section className="panel output-panel" aria-label="복약지도 출력">
      <div className="toolbar">
        <h2 className="out-title">영문 복약 안내 <span className="badge">English</span></h2>
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
          <div className="lang-group">
            <GuideView list={list} showKo={showKo} pharmacy={pharmacy} />
            <ScriptView list={list} showKo={showKo} onPlay={onPlay} />
          </div>
        ) : (
          <div className="placeholder">
            <p><strong>왼쪽에서 약을 선택하고 [목록에 추가]를 누르세요.</strong></p>
            <p>추가한 약들이 영문 복약 안내문으로 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
