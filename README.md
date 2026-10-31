# 영문 복약지도 가이드 (Next.js)

식약처 공공데이터로 약을 검색하고, 영문 복약 안내문과 구어체 복약지도 스크립트를 만드는 도구입니다. `durg_information`(바닐라 JS)을 Next.js(App Router, TypeScript)로 이식한 뒤 확장했습니다. 이식 계획은 [PLAN.md](PLAN.md)를 참고하세요.

## 실행

식약처 검색을 쓰려면 프로젝트 루트에 `.env.local`을 만들고 공공데이터포털 인증키를 넣습니다(깃에는 올라가지 않음). Vercel에서는 Settings → Environment Variables에 같은 이름으로 추가합니다.

```
MFDS_API_KEY=공공데이터포털_일반인증키
GEMINI_API_KEY=Google_AI_Studio_API_키
# GEMINI_MODEL=gemini-3.5-flash-lite   (선택, 기본값)
```

- `GEMINI_API_KEY`: 약사가 한국어로 직접 입력한 문구(경로·단위·횟수·시점·주기·주의사항·약 이름·약국명)를 영어로 번역합니다. 번역 후 원문을 보지 않은 별도 호출로 역번역해 뜻을 확인할 수 있게 보여줍니다. 브라우저는 `/api/translate`만 호출합니다.

사용 API: e약은요(`DrbEasyDrugInfoService/getDrbEasyDrugList`), 의약품 제품 허가정보(`DrugPrdtPrmsnInfoService08/getDrugPrdtPrmsnInq08`). 브라우저는 `/api/drugs/search?q=`만 호출하고, 키는 서버에만 있습니다.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## 구조

- `lib/mfds.ts` — 식약처 API 호출, 응답 → `Drug` 변환, 사용 경로·단위 추정 (서버 전용)
- `app/api/drugs/search/route.ts` — 검색 프록시
- `data/rx-data.ts` — 단위, 복용 시점, 공통 주의사항, 출력 문구
- `lib/` — 문장 생성(`sentences`, `spoken`), 복사용 텍스트(`plain-text`), 폼 변환, 저장소
- `hooks/` — `useSpeech`(음성 읽기), `useToast`
- `components/` — `RxApp`(상태 보유) → `InputPanel` / `OutputPanel` 등 (Mantine 사용)
- `app/globals.css` — 앱 스타일 + Mantine 색상 변수 연결
