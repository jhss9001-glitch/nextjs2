'use client';

import { Accordion, ActionIcon, Button, TextInput } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import KoInput from '@/components/KoInput';
import type { Drug, MfdsInfo, Tr } from '@/lib/types';

const MFDS_SECTIONS: [keyof MfdsInfo, string][] = [
  ['efcy', '효능'],
  ['ud', '용법용량 (허가사항)'],
  ['useMethod', '사용법'],
  ['atpnWarn', '사용 전 경고'],
  ['atpn', '주의사항'],
  ['intrc', '상호작용 (함께 쓰면 안 되는 약·음식)'],
  ['se', '부작용'],
  ['deposit', '보관법']
];

function Meta({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'wide' : undefined}>
      <div className="label">{label}</div>
      <div className="meta-value">{children}</div>
    </div>
  );
}

/** "선택한 약" 카드: 식약처 메타정보 · 영문명 · 원문(약사 참고용) / 직접 입력 */
export default function SelectedDrugCard({
  drug,
  custom,
  customName,
  nameStatus,
  onClear,
  onEnName,
  onToggleCustom,
  onCustomName
}: {
  drug: Drug | null;
  custom: boolean;
  customName: Tr;
  nameStatus: 'idle' | 'loading' | 'error';
  onClear: () => void;
  onEnName: (v: string) => void;
  onToggleCustom: () => void;
  onCustomName: (v: Tr) => void;
}) {
  const m = drug?.mfds;
  const sections = m ? MFDS_SECTIONS.filter(([k]) => m[k]) : [];

  return (
    <div className="card" id="selectedDrug">
      <div className="card-head">
        <div className="card-title">{custom ? '직접 입력한 약' : '선택한 약'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {m && <span className="card-meta">품목기준코드 {m.itemSeq}</span>}
          {(drug || custom) && (
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label="선택 해제" onClick={drug ? onClear : onToggleCustom}>
              <IconX size={14} />
            </ActionIcon>
          )}
        </div>
      </div>

      <div className="card-body">
        {!drug && !custom && (
          <div className="empty-drug">
            <span>상단 검색창에서 약을 검색해 선택하세요. <kbd className="kbd" style={{ color: 'inherit' }}>Ctrl K</kbd></span>
            <Button variant="default" size="xs" leftSection={<IconPlus size={14} />} onClick={onToggleCustom}>
              목록에 없는 약 직접 입력
            </Button>
          </div>
        )}

        {custom && (
          <KoInput
            kind="name"
            label="약 이름 (한국어로 입력하면 영어 이름으로 번역됩니다)"
            placeholder="예: 세파클러캡슐 250mg"
            value={customName}
            onChange={onCustomName}
            autoFocus
          />
        )}

        {drug && (
          <>
            <div className="meta-grid">
              <Meta label="제품명" wide>{drug.brand}</Meta>
              {m ? (
                <div className="wide">
                  <TextInput
                    label="영문 제품명 (안내문·스크립트에 표시)"
                    placeholder="예: Tylenol Tablet 500mg"
                    description={
                      drug.ing.en
                        ? undefined
                        : nameStatus === 'loading'
                          ? '식약처에 영문 제품명이 없어 한글 제품명을 영어로 옮기는 중…'
                          : '영문 제품명이 없습니다. 비워 두면 한글 제품명이 그대로 표시됩니다.'
                    }
                    value={drug.ing.en}
                    onChange={(e) => onEnName(e.currentTarget.value)}
                    size="xs"
                  />
                </div>
              ) : (
                <Meta label="영문명">{drug.ing.en}</Meta>
              )}
              <Meta label="분류">{drug.cat}</Meta>
              {m?.etcOtc && <Meta label="구분">{m.etcOtc}</Meta>}
              {m?.entpName && <Meta label="업체">{m.entpName}</Meta>}
              {m?.ingredient && <Meta label="성분 (영문)">{m.ingredient}</Meta>}
            </div>

            {m && (
              <div className="mfds-raw">
                <p className="mfds-note">
                  식약처 원문(약사 참고용) — 영어 안내문에는 들어가지 않습니다. 필요한 내용은 아래 용법의 “+ 직접 입력”으로 추가하세요.
                </p>
                {sections.length > 0 ? (
                  <Accordion variant="contained" chevronPosition="right" multiple radius="sm">
                    {sections.map(([k, label]) => (
                      <Accordion.Item key={k} value={k}>
                        <Accordion.Control>{label}</Accordion.Control>
                        <Accordion.Panel><div className="mfds-text">{m[k]}</div></Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                ) : (
                  <p className="mfds-note">e약은요 상세 정보가 없는 품목입니다(전문의약품 등).</p>
                )}
              </div>
            )}
          </>
        )}

        {drug && (
          <button type="button" className="link-btn" style={{ marginTop: 12 }} onClick={onToggleCustom}>
            + 목록에 없는 약 직접 입력
          </button>
        )}
      </div>
    </div>
  );
}
