import type { APODResponse } from '@/lib/nasa'
import type { Question } from '@/lib/questions'

export type Region = 'earth_orbit' | 'moon' | 'mars' | 'jupiter' | 'exoplanet'

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
  0,    // Lv 1
  100,  // Lv 2
  250,  // Lv 3
  450,  // Lv 4
  700,  // Lv 5
  1000, // Lv 6
  1350, // Lv 7
  1750, // Lv 8
  2200, // Lv 9
  2700, // Lv 10
  3300, // Lv 11
  4000, // Lv 12
  4800, // Lv 13
  5700, // Lv 14
  6700, // Lv 15
  7800, // Lv 16
  9000, // Lv 17
  10300, // Lv 18
  11700, // Lv 19
  13200, // Lv 20
]

export const XP_REWARDS = {
  correct: 50,
  riskCorrect: 120,
  riskWrong: -20,
} as const

export interface Equipment {
  analyzer: { uses: number }
}

export interface DailyMission {
  date: string        // "YYYY-MM-DD"
  completed: boolean
  streak: number
}

export interface CurrentMission {
  apodData: APODResponse
  question: Question
  selectedIndex: number | null
  isRisk: boolean
  eliminatedChoices: number[]  // indices removed by analyzer
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
  const unlocked = REGIONS.filter((r) => level >= r.minLevel)
  return unlocked[unlocked.length - 1] ?? REGIONS[0]
}

export function xpForNextLevel(currentXP: number): { current: number; needed: number; progress: number } {
  const level = getLevel(currentXP)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const needed = nextThreshold - currentThreshold
  const current = currentXP - currentThreshold
  return { current, needed, progress: needed > 0 ? current / needed : 1 }
}
