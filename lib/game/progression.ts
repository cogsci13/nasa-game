import {
  getLevel,
  REGIONS,
  type BadgeId,
  type ProgressStats,
  type Region,
  type RegionInfo,
} from '@/types/meta'

export interface CollectionBadge {
  id: BadgeId
  label: string
  description: string
  unlocked: boolean
}

export const BADGE_DEFINITIONS: Array<Omit<CollectionBadge, 'unlocked'>> = [
  {
    id: 'first-orbit',
    label: '첫 궤도 진입',
    description: '레벨 2 이상 달성',
  },
  {
    id: 'moon-window',
    label: '달 궤도 해금',
    description: '달 구역 진입',
  },
  {
    id: 'hot-streak',
    label: '연속 탐사',
    description: '스트릭 3일 달성',
  },
  {
    id: 'daily-pilot',
    label: '데일리 파일럿',
    description: '데일리 미션 3회 완료',
  },
  {
    id: 'arcade-runner',
    label: '아케이드 런너',
    description: '빠른 탐사 1회 완료',
  },
  {
    id: 'perfect-run',
    label: '완벽한 런',
    description: '생명 손실 없이 빠른 탐사 완주',
  },
]

export function getUnlockedRegions(xp: number): RegionInfo[] {
  const level = getLevel(xp)
  return REGIONS.filter((region) => level >= region.minLevel)
}

export function getNextRegion(xp: number): RegionInfo | null {
  const level = getLevel(xp)
  return REGIONS.find((region) => level < region.minLevel) ?? null
}

export function deriveUnlockedRegions(xp: number): Region[] {
  return getUnlockedRegions(xp).map((region) => region.id)
}

export function deriveUnlockedBadges({
  xp,
  streak,
  stats,
}: {
  xp: number
  streak: number
  stats: ProgressStats
}): BadgeId[] {
  const level = getLevel(xp)
  const unlocked: BadgeId[] = []

  if (level >= 2) unlocked.push('first-orbit')
  if (level >= 3) unlocked.push('moon-window')
  if (streak >= 3) unlocked.push('hot-streak')
  if (stats.dailyCompletions >= 3) unlocked.push('daily-pilot')
  if (stats.arcadeRuns >= 1) unlocked.push('arcade-runner')
  if (stats.perfectRuns >= 1) unlocked.push('perfect-run')

  return unlocked
}

export function getCollectionBadges(unlockedBadgeIds: BadgeId[]): CollectionBadge[] {
  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    unlocked: unlockedBadgeIds.includes(badge.id),
  }))
}
