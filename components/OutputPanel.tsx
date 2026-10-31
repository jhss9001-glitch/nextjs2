'use client';

import { ActionIcon, Button, SegmentedControl, Switch, Tooltip } from '@mantine/core';
import { IconCopy, IconPlayerStop, IconPrinter, IconVolume } from '@tabler/icons-react';
import { useState } from 'react';
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
  const [tab, setTab] = useState<'guide' | 'script'>('guide');

  return (
    <section className="col col-output" aria-label="영문 안내문 미리보기">
      <div className="out-toolbar">
        <SegmentedControl
          size="sm"
          value={tab}
          onChange={(v) => setTab(v as 'guide' | 'script')}
          data={[
            { value: 'guide', label: '안내문' },
            { value: 'script', label: '스크립트' }
          ]}
        />
        <div className="out-actions">
          <Switch
            id="showKo"
            size="sm"
            label="한국어 병기"
            checked={showKo}
            onChange={(e) => onShowKo(e.currentTarget.checked)}
          />
          <Tooltip label={speaking ? '읽기 중지' : '전체 읽어주기'}>
            <ActionIcon id="speakBtn" variant="default" size={36} aria-label={speaking ? '읽기 중지' : '전체 읽어주기'} onClick={onSpeak}>
              {speaking ? <IconPlayerStop size={16} /> : <IconVolume size={16} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="텍스트 복사">
            <ActionIcon id="copyBtn" variant="default" size={36} aria-label="텍스트 복사" onClick={onCopy}>
              <IconCopy size={16} />
            </ActionIcon>
          </Tooltip>
          {!framed && (
            <Button id="printBtn" color="dark" leftSection={<IconPrinter size={16} />} onClick={onPrint}>
              인쇄
            </Button>
          )}
        </div>
      </div>

      <div id="output" aria-live="polite">
        {list.length ? (
          <>
            {/* 인쇄는 탭과 상관없이 안내문을 출력하므로 항상 렌더하고 화면에서만 숨김 */}
            <div className={tab === 'guide' ? undefined : 'screen-hidden'}>
              <GuideView list={list} showKo={showKo} pharmacy={pharmacy} />
            </div>
            {tab === 'script' && <ScriptView list={list} showKo={showKo} onPlay={onPlay} />}
          </>
        ) : (
          <div className="placeholder">
            <p><strong>상단에서 약을 검색해 선택하고 [목록에 추가]를 누르세요.</strong></p>
            <p>추가한 약들이 영문 복약 안내문으로 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
