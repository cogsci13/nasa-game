import type { APODResponse } from '@/lib/nasa'
import type { Question, QuestionCategory } from '@/lib/questions'
import type { TrackerSatelliteMeta } from '@/lib/tracker'

export interface CurrentMission {
  apodData: APODResponse
  question: Question
  selectedIndex: number | null
  isRisk: boolean
  eliminatedChoices: number[]
}

export type RunMode = 'daily' | 'arcade'

export interface ArcadeRound {
  id: string
  question: Question
  event: ArcadeEventCard
  special: ArcadeSpecialRound | null
}

export type ArcadePowerupId = 'shield' | 'scanner' | 'time-warp'

export type ArcadeEventId = 'score-surge' | 'solar-wind' | 'fragile-hull' | 'combo-burst'

export interface ArcadePowerupState {
  shield: number
  scanner: number
  'time-warp': number
}

export interface ArcadeEventCard {
  id: ArcadeEventId
  title: string
  description: string
}

export type ArcadeSpecialRoundKind = 'apod-briefing' | 'tracker-lock'

export interface ArcadeSpecialRound {
  kind: ArcadeSpecialRoundKind
  title: string
  description: string
  rewardText: string
  category?: QuestionCategory
  trackerTarget?: TrackerSatelliteMeta
}

export type ArcadeTrackerBoostId = 'orbital-window' | 'crew-briefing' | 'signal-lock'

export interface ArcadeTrackerBoost {
  id: ArcadeTrackerBoostId
  title: string
  description: string
  rewardText: string
  satellite?: TrackerSatelliteMeta
}

export interface ArcadeTrackerBonuses {
  shieldBonus: number
  scannerBonus: number
  trackerLockBonusScore: number
  featuredSatellite: TrackerSatelliteMeta
  boosts: ArcadeTrackerBoost[]
}

export interface ArcadeSession {
  mode: 'arcade'
  rounds: ArcadeRound[]
  roundIndex: number
  score: number
  combo: number
  bestCombo: number
  specialSuccesses: number
  lives: number
  selectedIndex: number | null
  eliminatedChoices: number[]
  timeLeft: number
  status: 'idle' | 'active' | 'completed'
  rewardClaimed: boolean
  powerups: ArcadePowerupState
  shieldArmed: boolean
  trackerBonuses: ArcadeTrackerBonuses
}

export const XP_REWARDS = {
  correct: 50,
  riskCorrect: 120,
  riskWrong: -20,
} as const

export const ARCADE_TOTAL_ROUNDS = 5
export const ARCADE_INITIAL_LIVES = 2
export const ARCADE_ROUND_TIME = 15
