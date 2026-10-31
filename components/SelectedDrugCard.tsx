'use client';

import { Accordion, TextInput } from '@mantine/core';
import type { Drug, MfdsInfo } from '@/lib/types';

const MFDS_SECTIONS: [keyof MfdsInfo, string][] = [
  ['useMethod', '사용법'],
  ['atpnWarn', '사용 전 경고'],
  ['atpn', '주의사항'],
  ['intrc', '상호작용 (함께 쓰면 안 되는 약·음식)'],
  ['se', '부작용'],
  ['deposit', '보관법']
];

export default function SelectedDrugCard({
  drug,
  onClear,
  onEnName
}: {
  drug: Drug | null;
  onClear: () => void;
  onEnName: (v: string) => void;
}) {
  const m = drug?.mfds;
  const sections = m ? MFDS_SECTIONS.filter(([k]) => m[k]) : [];
  return (
    <div id="selectedDrug" className="selected-drug" hidden={!drug}>
      {drug && (
        <>
          <div className="sd-head">
            <div>
              <strong>{drug.brand}</strong>
              <span className="badge">{drug.cat}</span>
              <div className="sd-ing">
                {m ? [m.etcOtc, m.entpName, m.ingredient].filter(Boolean).join(' · ') : `${drug.ing.ko} · ${drug.ing.en}`}
              </div>
            </div>
            <button type="button" className="icon-btn" aria-label="선택 해제" onClick={onClear}>✕</button>
          </div>

          {m && (
            <TextInput
              className="sd-en"
              label="영문 약 이름 (영어 안내문에 표시)"
              placeholder="예: Acetaminophen 500 mg"
              description={drug.ing.en ? undefined : '비워 두면 한글 제품명이 그대로 표시됩니다.'}
              value={drug.ing.en}
              onChange={(e) => onEnName(e.currentTarget.value)}
            />
          )}

          {drug.use.ko && <div className="sd-use"><b>효능</b> {drug.use.ko}</div>}

          {drug.warn.length > 0 && (
            <div className="sd-warn">
              <b>약품별 주의사항 (자동 포함)</b>
              <ul>{drug.warn.map((w, i) => <li key={i}>{w.ko}</li>)}</ul>
            </div>
          )}

          {m && (
            <div className="sd-mfds">
              <p className="sd-note">
                식약처 원문(약사 참고용)입니다. 영어 안내문에는 포함되지 않으니, 필요한 내용은 아래 “추가 주의사항”에서 직접 입력하세요.
              </p>
              {sections.length > 0 ? (
                <Accordion variant="separated" chevronPosition="right" multiple>
                  {sections.map(([k, label]) => (
                    <Accordion.Item key={k} value={k}>
                      <Accordion.Control>{label}</Accordion.Control>
                      <Accordion.Panel><div className="sd-text">{m[k]}</div></Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <p className="sd-note">e약은요 상세 정보가 없는 품목입니다(전문의약품 등). 허가정보만 표시합니다.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
