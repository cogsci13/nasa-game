export type Region = 'earth_orbit' | 'moon' | 'mars' | 'jupiter' | 'exoplanet'

export type BadgeId =
  | 'first-orbit'
  | 'moon-window'
  | 'hot-streak'
  | 'daily-pilot'
  | 'arcade-runner'
  | 'perfect-run'

export type WeeklyGoalId = 'daily-streaker' | 'arcade-hopper' | 'sharp-eye'

export interface RegionInfo {
  id: Region
  name: string
  minLevel: number
  description: string
}

export const REGIONS: RegionInfo[] = [
  { id: 'earth_orbit', name: '지구 궤도', minLevel: 1, description: '매우 쉬운 미션' },
  { id: 'moon', name: '달', minLevel: 3, description: '기초 개념 미션' },
  { id: 'mars', name: '화성', minLevel: 5, description: '변수가 등장하는 미션' },
  { id: 'jupiter', name: '목성', minLevel: 10, description: '난이도 높은 미션' },
  { id: 'exoplanet', name: '외계 행성', minLevel: 20, description: '무작위성이 높은 미션' },
]

export const LEVEL_THRESHOLDS: number[] = [
  0,
  100,
  250,
  450,
  700,
  1000,
  1350,
  1750,
  2200,
  2700,
  3300,
  4000,
  4800,
  5700,
  6700,
  7800,
  9000,
  10300,
  11700,
  13200,
]

export interface Equipment {
  analyzer: { uses: number }
}

export interface DailyMission {
  date: string
  completed: boolean
  streak: number
}

export interface ProgressStats {
  dailyCompletions: number
  arcadeRuns: number
  perfectRuns: number
  correctAnswers: number
  wrongAnswers: number
  bestArcadeScore: number
  bestArcadeCombo: number
  bestSpecialSuccesses: number
}

export interface ArcadeRunRecord {
  id: string
  finishedAt: string
  score: number
  rewardXP: number
  roundsCleared: number
  livesLeft: number
  bestCombo: number
  specialSuccesses: number
  perfect: boolean
}

export interface WeeklyGoalDefinition {
  id: WeeklyGoalId
  label: string
  description: string
  target: number
  rewardXP: number
}

export interface WeeklyGoalProgress extends WeeklyGoalDefinition {
  progress: number
  completed: boolean
  claimed: boolean
}

export interface WeeklyGoalsState {
  weekKey: string
  goals: WeeklyGoalProgress[]
}

export function getLevel(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return level
}

export function getCurrentRegion(level: number): RegionInfo {
  const unlocked = REGIONS.filter((region) => level >= region.minLevel)
  return unlocked[unlocked.length - 1] ?? REGIONS[0]
}

export function xpForNextLevel(currentXP: number): {
  current: number
  needed: number
  progress: number
} {
  const level = getLevel(currentXP)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const needed = nextThreshold - currentThreshold
  const current = currentXP - currentThreshold

  return {
    current,
    needed,
    progress: needed > 0 ? current / needed : 1,
  }
}
