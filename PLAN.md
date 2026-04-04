# 🚀 우주 탐사단 키우기 (NASA API 기반 캐주얼 웹게임)

## 🎯 한 줄 컨셉
퀴즈를 풀며 탐사 데이터를 모으고 → 장비를 업그레이드 → 더 먼 우주로 진출하는 성장형 게임

---

# 1. 🎮 핵심 게임 루프

1. 미션 선택
2. 문제 풀이 (이미지/데이터 기반)
3. 결과 확인 (정답/오답)
4. 보상 획득 (크레딧, 경험치)
5. 장비 업그레이드

👉 1회 플레이: 10~30초

---

# 2. 🌌 미션 구조

## 2.1 이미지 분석 미션
- 데이터: APOD (Astronomy Picture of the Day)
- 문제 예시:
  - "이건 은하 / 성운 / 블랙홀 중 무엇인가?"

---

## 2.2 행성 판단 미션
- 데이터: 외계 행성 정보
- 문제 예시:
  - "이 행성에 생명체가 존재할 가능성이 있을까?"

---

## 2.3 화성 탐사 미션
- 데이터: Mars Rover 사진
- 문제 예시:
  - "이 지역은 탐사에 위험할까?"

---

# 3. 📈 레벨 & 지역 시스템

| 레벨 | 지역 | 특징 |
|------|------|------|
| Lv1 | 지구 궤도 | 매우 쉬움 |
| Lv3 | 달 | 기초 개념 |
| Lv5 | 화성 | 변수 등장 |
| Lv10 | 목성 | 난이도 상승 |
| Lv20 | 외계 행성 | 랜덤성 증가 |

👉 레벨 상승 시 지역 해금

---

# 4. 🔧 성장 시스템

## 장비 (초기 3종)

### 🔍 분석기
- 오답 제거 (선택지 감소)

### 📡 센서
- 힌트 제공

### 🚀 엔진
- 상위 지역 진입 가능

---

## 설계 포인트
- 정확도 중심 vs 보상 중심 전략 선택 가능

---

# 5. 💰 보상 시스템

## 기본 보상
- 크레딧 (화폐)
- 경험치 (레벨업)

## 추가 보상
- 희귀 이미지 (수집 요소)
- 탐사선 부품

---

# 6. ⚠️ 리스크 시스템

예시:
> "이 행성은 데이터가 부족합니다"

- 안전 탐사 → 보상 낮음
- 위험 탐사 → 보상 높음 + 실패 가능

👉 게임성 핵심 요소

---

# 7. 📱 UI 구조

## 단일 화면 구성
 [지역 / 레벨]

[이미지 or 데이터]

[문제]

[선택 버튼 3~4개]

[결과 + 보상] 
👉 클릭 1~2번으로 플레이 완료

---

# 8. 🏗️ 시스템 아키텍처

## Backend
- NASA API 호출
- 문제 생성 로직
- 정답 및 데이터 관리

## Frontend
- React / Next.js
- 상태 관리 (Zustand 추천)

## 데이터 처리
- 이미지/텍스트 → 키워드 추출
- 난이도 기반 문제 생성

---

# 9. 🚀 MVP 범위

## 포함 기능
- APOD 기반 퀴즈 (오늘의 이미지 = 오늘의 미션)
- **일일 미션 시스템** — 날짜 기반 스트릭, 매일 새 APOD
- 경험치 + 레벨 시스템 (localStorage 저장)
- 기본 힌트 기능 (분석기 장비 1개)
- 정적 문제 뱅크 (`lib/questions.ts`) — 정답 보장
- APOD 미디어 타입 체크 (비디오 APOD 대응)
- NASA API 응답 캐싱 (Zustand persist)

## 제외 기능
- LLM 자동 문제 생성 (Phase 2)
- 복잡한 경제 시스템
- 멀티플레이
- 화성/외계 행성 미션 (Phase 2)

## 핵심 파일 구조
```
lib/
  nasa.ts        # NASA API client (fetchAPOD, fetchMarsPhotos)
  questions.ts   # 정적 문제 뱅크 (APOD 카테고리별)
store/
  gameStore.ts   # Zustand store (XP, 레벨, 장비, 일일 미션)
components/
  QuizCard.tsx   # 메인 퀴즈 UI
  ResultCard.tsx # 결과 + 보상 표시
  HUD.tsx        # 레벨/지역 상태 표시
```

👉 1~3일 내 구현 가능 (일일 미션 포함 기준 +4시간)

---

# 10. 🔥 확장 로드맵

## Phase 2
- 장비 3종 추가
- 지역 시스템

## Phase 3
- 이미지 수집 기능
- 일일 미션

## Phase 4
- 랭킹 / PvP 시스템

---

# 11. 💡 차별화 포인트

- 실제 우주 데이터 기반 게임
- 플레이할수록 지식 축적
- 자동 콘텐츠 생성 (API 활용)

---

# 🧠 핵심 설계 철학

- 짧고 반복 가능한 플레이
- 점진적 성장 경험
- 선택 기반 전략 요소
- 현실 데이터 기반 몰입감

---

# 🎯 최종 포지셔닝

> "우주를 탐험하며 성장하는 데이터 기반 캐주얼 게임"

<!-- /autoplan restore point: /Users/builder/.gstack/projects/nasa-game/-autoplan-restore-20260404-180232.md -->

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|
| 1 | CEO | Static question bank for MVP | P5 (explicit), P6 (action) | Dynamic generation risks incorrect answers on day 1; static bank ships correctly | Live LLM tagging deferred to Phase 2 |
| 2 | CEO | Add daily mission mechanic to MVP scope | P1 (completeness), P2 (boil lakes) | APOD is literally a daily event system; not using it as daily hook is leaving retention on table | Deferred daily missions |
| 3 | CEO | LLM tagging → TODOS.md (Phase 2) | P3 (pragmatic) | Adds API cost + latency; not blocking MVP but solves biggest long-term risk | Excluded entirely |
| 4 | CEO | PWA → TODOS.md (Phase 2) | P3 (pragmatic) | 1 hour of work for major mobile retention win; defer until after initial validation | Excluded entirely |
| 5 | Design | Empty states are in-scope for MVP | P1 (completeness) | Loading/error/first-run states prevent confusing UX on first contact | Deferred empty states |
| 6 | Design | Design token set before coding | P5 (explicit) | Prevents per-component color drift; 30 min to define | Ad-hoc styling |
| 7 | Design | APOD image container with fixed aspect ratio + object-fit:contain | P5 (explicit) | APOD images vary in ratio; without this the layout breaks on many days | Free-form image sizing |
| 8 | Eng | NASA API client in lib/nasa.ts (not in components) | P5 (explicit) | Clean separation, testable | Inline fetch in components |
| 9 | Eng | Use Zustand persist middleware for localStorage | P5 (explicit) | Avoids hand-rolling persistence, handles hydration edge cases | Manual localStorage |
| 10 | Eng | media_type check on APOD response is in-scope for MVP | P1 (completeness) | ~5% of APOD entries are YouTube videos; game breaks without this check | Defer media_type handling |
| 11 | Eng | Rate limit caching is in-scope for MVP | P1 (completeness) | NASA free key is 30 req/hour; without caching, page refreshes can exhaust quota | Defer caching |
| 12 | GATE | Daily mission included in MVP | USER DECISION | User approved EUREKA finding: APOD as daily event system = core retention hook | Defer to Phase 2 |
