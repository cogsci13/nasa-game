# NASA Casual Game

Next.js 16 기반의 우주 테마 캐주얼 게임입니다. NASA APOD를 이용한 데일리 퀴즈, 5라운드 아케이드 세션, 진행도/배지/주간 목표, 실시간 위성 트래커를 한 앱 안에 묶었습니다.

## Modes

- `/`
  미션 허브. 현재 진행도, 주간 목표, 최근 아케이드 런, 각 모드 진입점을 보여줍니다.
- `/daily`
  NASA APOD 기반 하루 1회 데일리 미션입니다.
- `/play`
  5라운드 세션형 빠른 탐사 모드입니다. 파워업, 이벤트 카드, 트래커 연동 보정이 적용됩니다.
- `/collection`
  해금 구역, 배지, 주간 목표, 최근 런 기록을 확인하는 진행도 화면입니다.
- `/tracker`
  ISS, 허블, 텐궁 위치와 우주인 정보를 보여주는 이벤트 허브입니다.

## Stack

- `Next.js 16.2.2`
- `React 19`
- `TypeScript`
- `Tailwind CSS v4`
- `Zustand`
- `Leaflet`
- `Vitest`

## Environment

`.env.local` 또는 `.env.example` 기준으로 아래 값을 설정합니다.

```bash
NASA_API_KEY=DEMO_KEY
N2YO_API_KEY=your_n2yo_api_key
```

- `NASA_API_KEY`
  APOD 프록시 라우트에서 사용합니다. 비워두면 `DEMO_KEY`가 사용됩니다.
- `N2YO_API_KEY`
  위성 위치 트래커에서 사용합니다. 없으면 `/api/satellites`가 500을 반환합니다.

## Development

```bash
pnpm install
pnpm dev
```

기본 개발 서버는 `http://localhost:3000`에서 실행됩니다.

## Verification

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

## Project Structure

```text
app/
  page.tsx            # 홈
  daily/page.tsx      # 데일리 미션
  play/page.tsx       # 아케이드 런
  collection/page.tsx # 진행도/기록
  tracker/page.tsx    # 실시간 트래커
  api/                # 외부 API 프록시

components/game/      # 세션/HUD/데일리 UI
store/
  metaStore.ts        # 영구 진행도
  runStore.ts         # 현재 세션 상태
lib/game/             # 점수, 런 생성, 주간 목표, 트래커 보정
lib/questions/        # 문제 은행, 분류, 선택 로직
lib/content/          # 질문 공급자 계층
```

## Notes

- App Router 기반 프로젝트라 Next.js 16 문서 기준으로 작업해야 합니다.
- 트래커는 외부 API 의존성이 있으므로, 게임 코어 루프는 고정 문제 풀을 우선 사용하도록 분리되어 있습니다.
- 상태는 `metaStore`와 `runStore`로 분리되어 있으며, 각각 영구 진행도와 현재 플레이 세션을 담당합니다.
