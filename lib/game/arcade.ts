import { getRandomArcadeQuestion } from '@/lib/content/questionProviders'
import { TRACKED_SATELLITES } from '@/lib/tracker'
import {
  ARCADE_INITIAL_LIVES,
  ARCADE_ROUND_TIME,
  ARCADE_TOTAL_ROUNDS,
  type ArcadeEventCard,
  type ArcadeEventId,
  type ArcadePowerupState,
  type ArcadeRound,
  type ArcadeSpecialRound,
  type ArcadeSession,
  type ArcadeTrackerBonuses,
} from '@/types/run'

const ARCADE_EVENTS: Record<ArcadeEventId, ArcadeEventCard> = {
  'score-surge': {
    id: 'score-surge',
    title: '점수 서지',
    description: '이번 라운드 정답 점수 +25%',
  },
  'solar-wind': {
    id: 'solar-wind',
    title: '태양풍 가속',
    description: '이번 라운드 시작 시간 +3초',
  },
  'fragile-hull': {
    id: 'fragile-hull',
    title: '취약한 선체',
    description: '오답 시 생명 2 감소',
  },
  'combo-burst': {
    id: 'combo-burst',
    title: '콤보 버스트',
    description: '정답 시 콤보 +2',
  },
}

const EVENT_ORDER: ArcadeEventId[] = ['score-surge', 'solar-wind', 'fragile-hull', 'combo-burst']

const DEFAULT_TRACKER_BONUSES: ArcadeTrackerBonuses = {
  shieldBonus: 0,
  scannerBonus: 0,
  trackerLockBonusScore: 0,
  featuredSatellite: TRACKED_SATELLITES[0],
  boosts: [],
}

export function getInitialArcadePowerups(
  trackerBonuses: ArcadeTrackerBonuses = DEFAULT_TRACKER_BONUSES
): ArcadePowerupState {
  return {
    shield: 1 + trackerBonuses.shieldBonus,
    scanner: 1 + trackerBonuses.scannerBonus,
    'time-warp': 1,
  }
}

export function getArcadeRoundDuration(event: ArcadeEventCard): number {
  return event.id === 'solar-wind' ? ARCADE_ROUND_TIME + 3 : ARCADE_ROUND_TIME
}

export function buildArcadeRun(
  totalRounds = ARCADE_TOTAL_ROUNDS,
  trackerBonuses: ArcadeTrackerBonuses = DEFAULT_TRACKER_BONUSES
): ArcadeRound[] {
  return Array.from({ length: totalRounds }, (_, index) => {
    const question = getRandomArcadeQuestion()
    return {
      id: `arcade-round-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
      question,
      event: ARCADE_EVENTS[EVENT_ORDER[index % EVENT_ORDER.length]],
      special: getSpecialRound(index, question.category, trackerBonuses),
    }
  })
}

export function createArcadeSession(
  trackerBonuses: ArcadeTrackerBonuses = DEFAULT_TRACKER_BONUSES
): ArcadeSession {
  const rounds = buildArcadeRun(ARCADE_TOTAL_ROUNDS, trackerBonuses)
  return {
    mode: 'arcade',
    rounds,
    roundIndex: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    specialSuccesses: 0,
    lives: ARCADE_INITIAL_LIVES,
    selectedIndex: null,
    eliminatedChoices: [],
    timeLeft: getArcadeRoundDuration(rounds[0].event),
    status: 'active',
    rewardClaimed: false,
    powerups: getInitialArcadePowerups(trackerBonuses),
    shieldArmed: false,
    trackerBonuses,
  }
}

export function calculateArcadeReward(score: number, lives: number, powerups?: ArcadePowerupState): number {
  const bonus = Math.max(0, lives - 1) * 20
  const efficiencyBonus = powerups ? Object.values(powerups).reduce((sum, value) => sum + value, 0) * 10 : 0
  return Math.max(40, Math.round(score * 0.35) + bonus + efficiencyBonus)
}

export function calculateArcadeRoundScore(
  combo: number,
  timeLeft: number,
  event: ArcadeEventCard
): number {
  const baseScore = 90 + combo * 20 + timeLeft * 4
  return event.id === 'score-surge' ? Math.round(baseScore * 1.25) : baseScore
}

function getSpecialRound(
  index: number,
  category: ArcadeRound['question']['category'],
  trackerBonuses: ArcadeTrackerBonuses
): ArcadeSpecialRound | null {
  if (index === 1) {
    return {
      kind: 'apod-briefing',
      title: 'APOD 브리핑',
      description: `${formatCategoryLabel(category)} 아카이브 브리핑이 열렸습니다. 정답 시 추가 점수를 획득합니다.`,
      rewardText: '정답 시 +45 점수',
      category,
    }
  }

  if (index === 3) {
    const trackerTarget = trackerBonuses.featuredSatellite
    return {
      kind: 'tracker-lock',
      title: `${trackerTarget.label} 잠금`,
      description: `${trackerTarget.emoji} ${trackerTarget.label} 트래킹 채널과 연동된 특수 라운드입니다.`,
      rewardText:
        trackerBonuses.trackerLockBonusScore > 0
          ? `정답 시 보호막 1개 보급 + ${trackerBonuses.trackerLockBonusScore} 점수`
          : '정답 시 보호막 1개 보급',
      trackerTarget,
    }
  }

  return null
}

function formatCategoryLabel(category: ArcadeRound['question']['category']): string {
  switch (category) {
    case 'galaxy':
      return '은하'
    case 'nebula':
      return '성운'
    case 'planet':
      return '행성'
    case 'spacecraft':
      return '우주선'
    case 'star_cluster':
      return '성단'
    case 'solar_system':
      return '태양계'
    case 'black_hole':
      return '블랙홀'
    case 'unknown':
      return '미확인'
  }
}
