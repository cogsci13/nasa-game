export interface GameModeConfig {
  id: 'daily' | 'arcade'
  label: string
  description: string
}

export type QuestionSourceType = 'apod' | 'curated'

export interface QuestionSourceConfig {
  id: QuestionSourceType
  label: string
  description: string
}

export const GAME_MODE_CONFIGS: GameModeConfig[] = [
  {
    id: 'daily',
    label: '오늘의 미션',
    description: '하루 한 번 도전하는 NASA APOD 퀴즈',
  },
  {
    id: 'arcade',
    label: '빠른 탐사',
    description: '짧은 세션으로 연속 플레이하는 캐주얼 모드',
  },
]

export const QUESTION_SOURCE_CONFIGS: QuestionSourceConfig[] = [
  {
    id: 'apod',
    label: 'APOD Feed',
    description: 'NASA APOD 메타데이터를 기준으로 오늘의 질문을 고릅니다.',
  },
  {
    id: 'curated',
    label: 'Curated Pool',
    description: '외부 API 상태와 무관하게 고정 문제 풀에서 질문을 제공합니다.',
  },
]
