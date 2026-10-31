'use client';

import { ActionIcon, Button, Loader } from '@mantine/core';
import { IconAlertTriangle, IconPlus, IconRefresh, IconSparkles, IconX } from '@tabler/icons-react';
import KoInput from '@/components/KoInput';
import { emptyTr, type PatientInfo, type Tr } from '@/lib/types';

export interface InfoState {
  status: 'idle' | 'loading' | 'done' | 'error';
  source?: string;
  error?: string;
}

/**
 * "환자 설명" 카드: 무슨 약인지 · 흔한 부작용 · 이럴 땐 바로 병원에
 *  - 식약처 약은 효능효과·이상반응 원문을 요약한 초안이 자동으로 들어옴
 *  - 약사가 한국어로 고치면 영어는 다시 번역됨
 */
export default function PatientInfoCard({
  info,
  state,
  backs,
  hasDrug,
  onChange,
  onRetry
}: {
  info: PatientInfo;
  state: InfoState;
  backs: Record<string, string>; // 영어 → 역번역 (자동 요약 초안의 확인용)
  hasDrug: boolean;
  onChange: (info: PatientInfo) => void;
  onRetry: () => void;
}) {
  const set = (patch: Partial<PatientInfo>) => onChange({ ...info, ...patch });
  const setSide = (i: number, v: Tr) => set({ sideEffects: info.sideEffects.map((s, k) => (k === i ? v : s)) });
  const removeSide = (i: number) => set({ sideEffects: info.sideEffects.filter((_, k) => k !== i) });

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">환자 설명 <span className="card-sub">무슨 약 · 부작용</span></div>
        {state.source && <span className="card-meta">근거: {state.source}</span>}
      </div>

      {state.status !== 'idle' && (
        <div className="dosage-auto" aria-live="polite">
          {state.status === 'loading' && (
            <div className="dosage-status"><Loader size={14} /> 식약처 효능·부작용 정보를 환자용으로 요약하는 중…</div>
          )}
          {state.status === 'done' && (
            <div className="dosage-status">
              <IconSparkles size={14} /> 식약처 원문을 요약한 초안입니다 — <b>환자에게 말하기 전에 꼭 확인·수정하세요</b>
            </div>
          )}
          {state.status === 'error' && (
            <div className="dosage-status warn">
              <IconAlertTriangle size={14} /> 자동 요약을 못 했습니다: {state.error}
              {hasDrug && (
                <Button size="compact-xs" variant="subtle" leftSection={<IconRefresh size={12} />} onClick={onRetry}>
                  다시 시도
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card-body info-body">
        <KoInput
          kind="note"
          label="무슨 약인가요"
          placeholder="예: 혈압을 낮춰 주는 약이에요."
          value={info.purpose}
          back={backs[info.purpose.en]}
          onChange={(v) => set({ purpose: v })}
        />

        <div className="info-group">
          <div className="label">부작용 (흔하게 나타날 수 있는 것)</div>
          {info.sideEffects.map((s, i) => (
            <KoInput
              key={i}
              kind="note"
              label={`부작용 ${i + 1}`}
              placeholder="예: 어지러울 수 있어요."
              value={s}
              back={backs[s.en]}
              onChange={(v) => setSide(i, v)}
              rightAction={
                <ActionIcon size="sm" variant="subtle" color="gray" aria-label={`부작용 ${i + 1} 삭제`} onClick={() => removeSide(i)}>
                  <IconX size={14} />
                </ActionIcon>
              }
            />
          ))}
          <Button
            size="xs"
            variant="default"
            leftSection={<IconPlus size={12} />}
            onClick={() => set({ sideEffects: [...info.sideEffects, emptyTr()] })}
            style={{ alignSelf: 'flex-start' }}
          >
            부작용 추가
          </Button>
        </div>

        <KoInput
          kind="note"
          label="이럴 땐 바로 병원에 (심각한 부작용)"
          placeholder="예: 숨이 차거나 입술·얼굴이 부으면 바로 병원에 가세요."
          value={info.serious}
          back={backs[info.serious.en]}
          onChange={(v) => set({ serious: v })}
        />
      </div>
    </div>
  );
}
