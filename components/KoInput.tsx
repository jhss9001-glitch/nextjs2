'use client';

import { ActionIcon, Loader, TextInput, Tooltip } from '@mantine/core';
import { IconArrowBackUp, IconLanguage, IconPencil, IconRefresh } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import type { Tr } from '@/lib/types';

export type TranslateKind = 'route' | 'unit' | 'freq' | 'timing' | 'cycle' | 'days' | 'note' | 'name' | 'pharmacy';

interface TState {
  ko: string; // 이 상태가 어떤 한국어에 대한 것인지
  status: 'idle' | 'loading' | 'done' | 'error';
  back?: string;
  backPending?: boolean; // 영어는 받았고 확인용 한국어(역번역)를 기다리는 중
  error?: string;
}

/** 번역 결과를 화면에 보여줄 형태로: 단위 "puff|puffs" → "puff / puffs", 경로 "Inhale {dose}" → "Inhale …" */
export const displayEn = (kind: TranslateKind, en: string) => {
  if (kind === 'route') return en.replace('{dose}', '…');
  if (kind !== 'unit') return en;
  const [sg, pl = sg] = en.split('|');
  return sg === pl ? sg : `${sg} / ${pl}`;
};

/**
 * 한국어 → 영어 자동 번역 훅
 *  - value.ko가 바뀌고 value.en이 비어 있으면 잠시 뒤 서버(/api/translate)에 번역 요청
 *  - 결과가 도착했을 때 입력이 그대로면 onChange({ ko, en })
 */
export function useAutoTranslate(kind: TranslateKind, value: Tr, onChange: (v: Tr) => void, delay = 700) {
  const [st, setSt] = useState<TState>({ ko: '', status: 'idle' });
  const [nonce, setNonce] = useState(0);
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });

  useEffect(() => {
    const ko = value.ko.trim();
    if (!ko || value.en) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setSt({ ko, status: 'loading' });
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 영어를 먼저 받아 바로 보여 주고, 확인용 역번역은 뒤이어 따로 받음 (체감 속도)
        body: JSON.stringify({ kind, ko, noBack: true }),
        signal: ctrl.signal
      })
        .then((r) => r.json())
        .then((j: { en?: string; back?: string; error?: string }) => {
          if (j.error || !j.en) { setSt({ ko, status: 'error', error: j.error || '번역 결과가 비어 있습니다.' }); return; }
          const en = j.en;
          setSt({ ko, status: 'done', backPending: true });
          const cur = latest.current;
          if (cur.value.ko.trim() === ko) cur.onChange({ ko: cur.value.ko, en });
          // 이 요청은 영어가 채워지면 effect 정리로 취소되므로 별도 요청으로 보냄
          fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind, ko, en, backOnly: true })
          })
            .then((r) => r.json())
            .then((b: { back?: string }) => setSt((s) => (s.ko === ko ? { ko, status: 'done', back: b.back || undefined } : s)))
            .catch(() => setSt((s) => (s.ko === ko ? { ko, status: 'done' } : s)));
        })
        .catch((e: Error) => {
          if (e.name !== 'AbortError') setSt({ ko, status: 'error', error: e.message });
        });
    }, delay);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [kind, value.ko, value.en, nonce, delay]);

  const ko = value.ko.trim();
  const mine = st.ko === ko;
  return {
    loading: !!ko && !value.en && (!mine || st.status === 'loading' || st.status === 'idle'),
    error: mine && st.status === 'error' && !value.en ? st.error : undefined,
    back: mine && value.en ? st.back : undefined,
    // 방금 번역했는데 역번역을 못 받은 경우 (사용량 한도 등) → 약사가 확인 없이 넘어가지 않게 표시
    backPending: mine && !!value.en && !!st.backPending,
    backMissing: mine && !!value.en && st.status === 'done' && !st.back && !st.backPending,
    retry: () => setNonce((n) => n + 1)
  };
}

/** 한국어로 입력하면 영어 안내문용 번역을 자동으로 붙여 주는 입력칸 */
export default function KoInput({
  kind,
  label,
  placeholder,
  value,
  onChange,
  className,
  autoFocus,
  onEnter,
  back,
  rightAction
}: {
  kind: TranslateKind;
  label: string;
  placeholder?: string;
  value: Tr;
  onChange: (v: Tr) => void;
  className?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  back?: string; // 서버에서 미리 번역해 온 값의 역번역 (이 칸에서 번역하지 않았을 때 표시)
  rightAction?: React.ReactNode; // 입력칸 오른쪽 버튼 (예: 삭제)
}) {
  const [editEn, setEditEn] = useState(false);
  const auto = useAutoTranslate(kind, value, onChange);
  const tr = { ...auto, back: auto.back ?? (value.en ? back : undefined) };

  return (
    <div className={`ko-input ${className ?? ''}`}>
      <TextInput
        size="xs"
        label={label}
        placeholder={placeholder}
        value={value.ko}
        autoFocus={autoFocus}
        // 한국어를 고치면 이전 번역은 버리고 다시 번역
        onChange={(e) => { setEditEn(false); onChange({ ko: e.currentTarget.value, en: '' }); }}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); } }}
        rightSection={tr.loading ? <Loader size={12} /> : rightAction ?? null}
      />
      {value.ko.trim() && (
        <div className="tr-result" aria-live="polite">
          {editEn ? (
            <TextInput
              size="xs"
              aria-label="영어 직접 수정"
              value={value.en}
              onChange={(e) => onChange({ ko: value.ko, en: e.currentTarget.value })}
            />
          ) : tr.loading ? (
            <span className="tr-status">영어로 번역 중…</span>
          ) : tr.error ? (
            <span className="tr-status err">
              번역 실패: {tr.error}
              <ActionIcon size="xs" variant="subtle" aria-label="다시 번역" onClick={tr.retry}><IconRefresh size={12} /></ActionIcon>
            </span>
          ) : (
            <>
              <span className="tr-en" lang="en"><IconLanguage size={12} /> {displayEn(kind, value.en)}</span>
              {tr.back && (
                <span className="tr-back"><IconArrowBackUp size={12} /> 다시 한국어로: {tr.back}</span>
              )}
              {tr.backPending && !tr.back && (
                <span className="tr-back"><Loader size={10} /> 확인용 한국어 번역 중…</span>
              )}
              {tr.backMissing && (
                <span className="tr-back err">
                  <IconArrowBackUp size={12} /> 확인용 한국어 번역을 받지 못했습니다 — 잠시 뒤 다시 번역해 확인하세요.
                  <ActionIcon size="xs" variant="subtle" aria-label="다시 번역" onClick={() => onChange({ ko: value.ko, en: '' })}>
                    <IconRefresh size={12} />
                  </ActionIcon>
                </span>
              )}
            </>
          )}
          {!tr.loading && (
            <Tooltip label={editEn ? '수정 완료' : '영어를 직접 고치기'}>
              <ActionIcon size="xs" variant="subtle" color="gray" aria-label="영어 직접 수정" onClick={() => setEditEn(!editEn)}>
                <IconPencil size={12} />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
