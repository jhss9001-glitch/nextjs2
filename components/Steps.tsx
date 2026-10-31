import { IconCheck } from '@tabler/icons-react';

type StepState = 'done' | 'now' | 'todo';

/** 진행 단계: ① 약 검색 → ② 용법 확인 → ③ 안내문 출력 (처음 쓰는 약사도 흐름을 따라오게) */
export default function Steps({ drugName, count }: { drugName: string | null; count: number }) {
  const picked = drugName !== null;
  const steps: { title: string; sub: string; state: StepState }[] = [
    { title: '약 검색', sub: drugName || '제품명이나 성분명으로 검색', state: picked ? 'done' : 'now' },
    { title: '용법 확인', sub: picked ? '자동 입력값을 처방과 대조하세요' : '약을 고르면 식약처 용법이 채워집니다', state: picked ? 'now' : 'todo' },
    {
      title: '안내문 출력',
      sub: count ? `조제 목록 ${count}개 · 인쇄·복사·음성` : '목록에 추가하면 안내문이 만들어집니다',
      state: count ? (picked ? 'done' : 'now') : 'todo'
    }
  ];
  return (
    <div className="steps-wrap">
      <ol className="steps" aria-label="진행 단계">
        {steps.map((s, i) => (
          <li key={s.title} className={`step ${s.state}`} aria-current={s.state === 'now' ? 'step' : undefined}>
            <span className="step-n">{s.state === 'done' ? <IconCheck size={14} stroke={2.5} /> : i + 1}</span>
            <span className="step-txt">
              <b>{s.title}</b>
              <small>{s.sub}</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
