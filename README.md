# 다국어 복약지도 가이드 (Next.js)

`durg_information`(바닐라 JS)을 Next.js(App Router, TypeScript)로 이식한 버전입니다. 기능·문구·스타일은 원본과 동일합니다. 이식 계획은 [PLAN.md](PLAN.md)를 참고하세요.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## 구조

- `data/rx-data.ts` — 약품(DRUGS), 단위, 복용 시점, 공통 주의사항, 출력 문구
- `lib/` — 문장 생성(`sentences`, `spoken`), 복사용 텍스트(`plain-text`), 검색, 폼 변환, 저장소
- `hooks/` — `useSpeech`(음성 읽기), `useToast`
- `components/` — `RxApp`(상태 보유) → `InputPanel` / `OutputPanel` 등
- `app/globals.css` — 원본 `style.css` 그대로

## 새 약 추가

`data/rx-data.ts`의 `DRUGS` 배열에 같은 형식으로 항목을 추가합니다. `route`는 `'oral'`(내복) | `'eye'`(점안) | `'topical'`(외용)입니다.
