# durg_information → Next.js 전환 계획

## 1. 목표와 원칙

- **목표**: 바닐라 JS 기반 "다국어 복약지도 가이드"(index.html / app.js / data.js / style.css)를 Next.js(App Router, TypeScript)로 이식한다.
- **원칙: 기능·문구·화면 100% 동일 이식.** 문장 생성 규칙, 약품 데이터, 번역 문구, 스타일, 단축키, 인쇄 동작을 바꾸지 않는다. 리팩터링·기능 추가는 이식 완료 후 별도 단계로 미룬다.
- **비목표(이번 범위 밖)**: 서버/DB, 로그인, 새 약품 추가, 디자인 개편, 다국어 라우팅(i18n).

## 2. 현황 분석

| 파일 | 크기 | 역할 |
|---|---|---|
| index.html | 4.9KB | 헤더 / 입력 패널(약 선택, 복용 방법, 추가 주의사항, 조제 목록) / 출력 패널(언어 탭, 액션 버튼, 출력) / 푸터 / 토스트 |
| app.js | 37KB | IIFE 단일 스크립트. DOM 직접 조작 + `state` 객체 + `innerHTML` 템플릿 렌더링 |
| data.js | 40KB | `window.RX_DATA = { DRUGS, UNITS, TIMINGS, GENERAL, UI }` (약품 목록 + 4개 언어 문구) |
| style.css | 16KB | CSS 변수 기반 테마(라이트/다크 `prefers-color-scheme` + `data-theme`), 반응형(900px / 520px), 인쇄 스타일 |

### app.js 기능 목록 (이식 체크리스트의 기준)
1. **약 검색**: 제품명/성분명(ko·en·zh·ja)/별칭/분류 검색, `norm()` 정규화, ↑↓/Enter/Esc 키보드 탐색, 바깥 클릭 시 닫기
2. **선택된 약 카드**: 효능, 약품별 주의사항(자동 포함), 선택 해제(✕)
3. **직접 입력 모드**: 약 이름 + 사용 경로(내복/점안/외용)
4. **복용 방법 폼**: 용량·단위, 1일 횟수(1~6/필요시), 복용 시점, 기간, 최소 복용 간격, 1일 최대 횟수 — 경로·PRN 여부에 따른 필드 표시/숨김, 점안은 단위 `drop` 고정
5. **한국어 미리보기** (`directions(it,'ko')`)
6. **추가 주의사항(GENERAL) 체크박스**
7. **조제 목록**: 추가 / 수정(수정 완료·수정 취소) / 삭제 / 위로 이동 / 전체 비우기(3초 내 재클릭 확인)
8. **출력**: 언어 탭(en/zh/ja/전체), 한국어 병기 토글, 약국명 입력, 안내문(`renderGuide`) + 구어체 스크립트(`renderScript`)
9. **문장 생성 로직**: `S`(안내문), `SP`(구어체), `qtyText/freqText/timingText/koSpokenQty/spokenFreq`, `directions/spokenDirections/cautions/buildScript`
10. **음성 읽기(TTS)**: 전체 읽어주기/중지, 문장별 ▶ 재생, 음성 미설치 안내 토스트, 언어 탭 전환 시 중지
11. **텍스트 복사**: `plainText()` + clipboard API, `execCommand` 폴백
12. **인쇄**: `window.print()`, iframe 안에서는 인쇄 버튼 숨김
13. **localStorage 저장**: `rx.lang`, `rx.showKo`, `rx.pharmacy`
14. **토스트 알림** (1.8초)

## 3. 핵심 설계 결정

### 3.1 렌더링 방식: 클라이언트 컴포넌트 중심
- 앱 전체가 브라우저 API(localStorage, speechSynthesis, clipboard, print, `window.top`)에 의존하는 인터랙티브 도구이므로 **페이지 본문은 `'use client'` 컴포넌트**로 구성한다.
- `app/layout.tsx`, `app/page.tsx`는 서버 컴포넌트로 두고 메타데이터(`<title>다국어 복약지도 가이드</title>`, `lang="ko"`, viewport)만 담당한다.
- **하이드레이션 주의**: localStorage 값(`rx.lang`, `rx.showKo`, `rx.pharmacy`)과 `today()`(현재 날짜)는 서버/클라이언트 결과가 달라질 수 있다. → 초기 상태는 기본값으로 시작하고 `useEffect`에서 localStorage를 읽어 반영한다. 날짜는 마운트 후에만 렌더하거나 `suppressHydrationWarning`을 사용한다.

### 3.2 상태 관리: React 내장 훅만 사용 (외부 라이브러리 없음)
기존 `state` 객체를 `useReducer` 또는 `useState`로 옮긴다.

```ts
type Item = {            // readForm()의 반환 형태 그대로
  drugId: string | null; customName: string; route: Route;
  qty: number; unit: UnitKey; freq: string; timing: TimingKey;
  days: number | null; interval: number | null; max: number | null;
  general: GeneralKey[];
};
// 앱 상태: drug, custom, list: Item[], editIndex, lang, showKo, pharmacy, 폼 필드들, 검색어/활성 인덱스
```

- 폼 필드(qty, unit, freq, timing, days, interval, maxDaily, general 체크)는 **제어 컴포넌트**로 전환 (기존 `el.xxx.value` 직접 읽기/쓰기 → state).
- `updateVisibility()`는 상태에서 파생되는 값(`hidden`/`disabled`)으로 대체 — 별도 상태로 두지 않는다.
- `previewKo`는 폼 state에서 매 렌더 계산(파생값).

### 3.3 순수 로직은 UI에서 분리 (그대로 복사 후 타입만 추가)
- 문장 생성 함수들(`directions`, `spokenDirections`, `cautions`, `buildScript`, `plainText` 등)은 DOM에 의존하지 않는 순수 함수이므로 `lib/`로 **로직 변경 없이** 옮긴다. 기존에 전역 `state`/`el`을 읽는 부분(`state.list`, `state.showKo`, `el.pharmacy.value`)만 **인자로 받도록** 시그니처를 바꾼다.
- 이 분리로 이식 전/후 출력 문자열을 **스냅샷 비교**할 수 있다 (6장 검증 참고).

### 3.4 `innerHTML` + `esc()` → JSX
- 문자열 템플릿 + `esc()`는 JSX로 대체한다. React가 자동 이스케이프하므로 `esc()`는 제거한다. `dangerouslySetInnerHTML`은 쓰지 않는다.
- 단, `UI.purpose[lang]` 같은 `esc()` 없이 삽입되던 값은 정적 문구이므로 JSX 텍스트로 동일하게 출력된다.
- DOM 클래스명(`g-item`, `s-line`, `lang-group` 등)은 **전부 그대로 유지**해 CSS 변경을 최소화한다.

### 3.5 스타일: 기존 CSS 그대로 사용
- `style.css` → `app/globals.css`로 **내용 변경 없이** 이동 (CSS 변수, 다크모드, 반응형, `@media print` 포함).
- CSS Modules/Tailwind로 바꾸지 않는다 (클래스 이름 기반 인쇄 규칙 `.input-panel`, `.script` 등이 깨지지 않도록).
- `hidden` 속성 기반 표시/숨김은 React에서 `hidden={...}` prop으로 동일하게 동작한다. (CSS에 `[hidden]` 규칙이 있는지 확인 필요 — 7장 리스크)

### 3.6 데이터: `window.RX_DATA` → 타입이 있는 ES 모듈
- `data.js`를 `data/rx-data.ts`로 변환: `export const DRUGS`, `UNITS`, `TIMINGS`, `GENERAL`, `UI`.
- 내용(약품 값, 번역 문구)은 **한 글자도 바꾸지 않는다.** IIFE/`window` 할당만 제거하고 `as const` 또는 인터페이스로 타입을 부여한다.
- 기존 주석(새 약 추가 방법, `route` 값 설명)은 유지한다.

## 4. 목표 디렉터리 구조

```
durg-information-next/
├─ app/
│  ├─ layout.tsx          # <html lang="ko">, metadata, globals.css import
│  ├─ page.tsx            # <RxApp /> 렌더
│  └─ globals.css         # style.css 이동
├─ components/
│  ├─ RxApp.tsx           # 'use client' 루트: 전체 상태 보유, 두 패널 조합
│  ├─ AppHeader.tsx       # 로고 + 약국명 입력
│  ├─ InputPanel.tsx
│  │  ├─ DrugSearch.tsx       # 검색 + 결과 리스트 + 키보드 탐색
│  │  ├─ SelectedDrugCard.tsx # 선택 약 정보
│  │  ├─ CustomDrugFields.tsx # 직접 입력
│  │  ├─ DosageForm.tsx       # 2단계 복용 방법 + 미리보기
│  │  ├─ GeneralChecks.tsx    # 3단계 추가 주의사항
│  │  └─ RxList.tsx           # 조제 목록 (수정/삭제/위로/전체 비우기)
│  ├─ OutputPanel.tsx     # 탭, 한국어 병기, 액션 버튼
│  │  ├─ GuideView.tsx        # renderGuide
│  │  └─ ScriptView.tsx       # renderScript
│  ├─ Toast.tsx
│  └─ AppFooter.tsx
├─ lib/
│  ├─ sentences.ts        # S, directions, cautions, qtyText/freqText/timingText
│  ├─ spoken.ts           # SP, spokenDirections, buildScript, koSpokenQty, spokenFreq
│  ├─ plain-text.ts       # plainText
│  ├─ search.ts           # norm, searchDrugs
│  ├─ speech.ts           # speakQueue 등 TTS 래퍼
│  ├─ storage.ts          # store.get/set (try/catch 유지)
│  └─ types.ts
├─ hooks/
│  ├─ useLocalStorage.ts  # 마운트 후 로드, 실패 무시
│  ├─ useToast.ts
│  └─ useSpeech.ts        # speaking 상태 + 중지
├─ data/rx-data.ts        # data.js 이식
└─ PLAN.md
```

## 5. 단계별 작업 계획

### 단계 0 — 준비
1. 새 폴더에 Next.js 프로젝트 생성: `npx create-next-app@latest durg-information-next --ts --app --eslint --no-tailwind --no-src-dir --import-alias "@/*"`
2. 기존 폴더는 **그대로 보존**(비교 기준). 새 프로젝트는 별도 폴더에서 진행.
3. 원본 출력 기준 확보: 대표 시나리오 몇 개를 원본에서 실행해 출력 텍스트/스크린샷을 저장 (검증용 기준선).

### 단계 1 — 정적 자산 이식 (동작 없음)
1. `data.js` → `data/rx-data.ts` (타입 부여, 내용 무변경).
2. `style.css` → `app/globals.css` (무변경).
3. `layout.tsx`에 `lang="ko"`, metadata, `globals.css` 연결.
4. `index.html` 마크업을 정적 JSX로 옮겨 **화면이 원본과 시각적으로 동일한지** 먼저 확인.

### 단계 2 — 순수 로직 이식
1. `lib/types.ts`: `Drug`, `Item`, `Lang`, `Route` 등.
2. `lib/sentences.ts`, `lib/spoken.ts`, `lib/plain-text.ts`, `lib/search.ts` — 원본 함수를 복사하고 전역 의존만 인자화.
3. **스냅샷 테스트**: 원본 `app.js`와 새 `lib`가 같은 입력(`Item`)에 대해 같은 문자열을 내는지 비교 (모든 DRUGS × route × freq/prn × days 조합).

### 단계 3 — 입력 패널
1. `DrugSearch`: 입력/포커스 시 결과 표시, ↑↓ Enter Esc, `mousedown` 선택(blur 전 처리), 바깥 클릭 닫기 → `useEffect` + document 리스너.
2. `SelectedDrugCard`, `CustomDrugFields`(토글 문구 "+ 목록에 없는 약 직접 입력" / "− 직접 입력 취소" 유지).
3. `DosageForm`: 경로/PRN별 필드 표시 규칙, 점안 시 단위 `drop` 고정+비활성화, 한국어 미리보기.
4. `GeneralChecks`, 약 선택 시 `def`/`general` 기본값 적용(`applyDefaults`), `resetForm` 기본값 `{unit:'tab', qty:1, freq:'3', timing:'after_30', interval:4}` 유지.
5. `RxList`: 추가/수정/수정 취소/삭제/위로 이동 시 `editIndex` 보정 로직(삭제·이동 시 인덱스 조정) 그대로 이식, 전체 비우기 2단계 확인(3초 타이머 — `useRef`로 타이머 관리, 언마운트 시 정리).

### 단계 4 — 출력 패널
1. 탭(`role="tablist"`, `aria-selected`), 한국어 병기 스위치, 약국명 입력.
2. `GuideView`(`renderGuide`), `ScriptView`(`renderScript`) — 클래스명/구조/`lang` 속성 동일 유지. 빈 목록 placeholder 문구 동일.
3. `aria-live="polite"` 유지.

### 단계 5 — 브라우저 API 기능
1. **TTS**: `useSpeech` 훅. `speakQueue`(음성 선택, rate 0.9, 마지막 발화 종료 시 버튼 문구 복원), 전체 읽어주기 ↔ 읽기 중지 토글, 탭 전환 시 취소, `getVoices()` 비동기 로드 대응. 언마운트 시 `speechSynthesis.cancel()`.
2. **복사**: clipboard API → `textarea` + `execCommand` 폴백 그대로.
3. **인쇄**: `window.print()`, 목록이 비었을 때 토스트. iframe 판별(`window.self !== window.top`)은 **마운트 후** 계산(SSR 안전).
4. **localStorage**: `rx.lang`(기본 `'en'`), `rx.showKo`(기본 `true`), `rx.pharmacy` — 키 이름 유지(기존 사용자 저장값 호환).
5. **Toast**: 1.8초 표시 후 사라짐, 연속 호출 시 타이머 갱신.

### 단계 6 — 마무리
1. 인쇄 미리보기 비교 (`@media print`: 입력 패널·스크립트 숨김, 언어별 페이지 나눔).
2. 다크모드/라이트모드, 모바일(≤900px, ≤520px) 레이아웃 확인.
3. `next build` 통과, ESLint/TypeScript 오류 0.
4. README에 실행 방법(`npm run dev`)과 "새 약 추가 방법"(`data/rx-data.ts`) 기록.

## 6. 검증 방법 (동일성 확인)

- **로직**: 단계 2의 스냅샷 비교 — 원본과 문자열 100% 일치해야 통과.
- **UI 수동 시나리오** (원본과 나란히 비교):
  1. 타이레놀 선택 → 기본값(필요시/간격 4h/최대 4회) 자동 적용, 약품별 주의사항 표시
  2. 점안제 선택 → 단위 `방울` 고정, 복용 시점 숨김
  3. 외용제 선택 → 용량 숨김
  4. 직접 입력(내복/점안/외용) 추가
  5. 3개 이상 추가 후 위로 이동 / 수정 / 수정 취소 / 삭제 / 전체 비우기(2회 클릭)
  6. 언어 탭 en/zh/ja/전체 × 한국어 병기 on/off
  7. 약국명 입력 → 헤더 반영, 새로고침 후 값·탭·병기 설정 유지
  8. 텍스트 복사 결과 비교, 인쇄 미리보기 비교
  9. 전체 읽어주기 / 문장별 ▶ / 중지, 탭 전환 시 중지
  10. 검색: `타이레놀`, `ibuprofen`, 성분명 중/일어, 공백·특수문자 포함, 결과 없음 메시지
- **접근성**: `role`, `aria-*`, `aria-live`, 키보드 조작이 원본과 동일한지 확인.

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| SSR/하이드레이션 불일치 (localStorage, 날짜, iframe 판별) | 마운트 후 `useEffect`에서 읽기, 날짜는 클라이언트에서만 계산 |
| 검색 결과 `mousedown` 선택 / blur 순서 | 원본처럼 `onMouseDown` + `preventDefault` 사용, `onClick`으로 바꾸지 않음 |
| `hidden` 속성이 CSS `display`에 덮어써질 수 있음 | 원본 CSS에 `[hidden]` 규칙 유무 확인, 동작이 다르면 CSS는 건드리지 않고 조건부 렌더로 대체 |
| 폼 값의 문자열/숫자 타입 혼재(`days`, `interval`, `max`는 `''` 또는 숫자 문자열) | `readForm()`의 변환 규칙(`Number(...)`, 빈 값 → `null`)을 그대로 유지 |
| `qty` 입력 중간값(빈 값/0) 처리 | 원본 `Math.max(0.5, Number(v) \|\| 1)` 동작을 동일하게 적용 |
| TTS 음성 목록이 비동기 로드 | `voiceschanged` 이벤트 또는 호출 시점에 `getVoices()` 재조회 |
| React StrictMode의 effect 이중 실행으로 TTS/타이머 중복 | cleanup 함수에서 타이머 해제·`speechSynthesis.cancel()` |
| 인쇄 시 React 컴포넌트 경계 때문에 CSS 선택자 깨짐 | 클래스명·DOM 계층 구조를 원본과 동일하게 유지 |
| 대용량 data(40KB)가 번들에 포함 | 클라이언트에서 모두 필요하므로 그대로 번들링(40KB는 문제 없음) |

## 8. 이식 후 가능한 개선 (이번 범위 아님)

- 조제 목록을 localStorage에 저장 / URL 공유
- 약품 데이터 JSON 분리 및 검수 도구
- 테스트(Vitest + Testing Library) 정식 도입, Playwright E2E
- 언어 추가(베트남어 등) — `Lang` 타입 확장 지점 정리
- 약품 상세/목록 페이지 분리(라우팅 활용)

## 9. 완료 기준 (Definition of Done)

- [ ] 2장의 기능 14개 항목이 모두 원본과 동일하게 동작
- [ ] 스냅샷 비교: 안내문·스크립트·복사 텍스트 문자열 100% 일치
- [ ] 라이트/다크/모바일/인쇄 화면 육안 비교 통과
- [ ] `next build` 성공, 타입·린트 오류 없음
- [ ] localStorage 키(`rx.lang`, `rx.showKo`, `rx.pharmacy`) 호환
- [ ] README 작성
