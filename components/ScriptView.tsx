'use client';

import { ActionIcon } from '@mantine/core';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { buildScript } from '@/lib/spoken';
import type { Item } from '@/lib/types';

/** 구어체 복약지도 스크립트 */
export default function ScriptView({
  list,
  showKo,
  onPlay
}: {
  list: Item[];
  showKo: boolean;
  onPlay: (text: string) => void;
}) {
  const blocks = buildScript(list, 'en');
  const blocksKo = buildScript(list, 'ko');
  return (
    <section className="card script" lang="en" aria-label="복약지도 스크립트">
      <p className="s-hint" lang="ko">환자에게 그대로 읽어 주세요. ▶ 버튼을 누르면 해당 문장을 음성으로 들려줍니다.</p>
      {blocks.map((b, bi) => (
        <div key={bi}>
          <div className="s-label" lang="ko">{b.label}</div>
          {b.lines.map((t, li) => {
            const ko = blocksKo[bi].lines[li];
            return (
              <p className="s-line" key={li}>
                <ActionIcon variant="light" radius="xl" size={30} aria-label="이 문장 듣기" onClick={() => onPlay(t)}>
                  <IconPlayerPlayFilled size={12} />
                </ActionIcon>
                <span className="s-text">
                  {t}
                  {showKo && ko && <span className="ko" lang="ko">{ko}</span>}
                </span>
              </p>
            );
          })}
        </div>
      ))}
    </section>
  );
}
