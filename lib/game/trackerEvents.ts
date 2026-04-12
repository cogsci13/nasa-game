import { TRACKED_SATELLITES, type TrackerSatelliteMeta } from '@/lib/tracker'
import type { BadgeId, ProgressStats, Region } from '@/types/meta'
import type { ArcadeTrackerBonuses, ArcadeTrackerBoost } from '@/types/run'

export interface TrackerEventInput {
  xp: number
  streak: number
  stats: ProgressStats
  unlockedRegionIds: Region[]
  unlockedBadgeIds: BadgeId[]
}

export interface TrackerEventCardState extends ArcadeTrackerBoost {
  status: 'active' | 'pending'
}

export function getTrackerEventState(
  input: TrackerEventInput,
  now = new Date()
): {
  featuredSatellite: TrackerSatelliteMeta
  boosts: TrackerEventCardState[]
  bonuses: ArcadeTrackerBonuses
} {
  const featuredSatellite = getFeaturedSatellite(now)

  const orbitalWindowActive = input.unlockedRegionIds.length >= 2
  const crewBriefingActive = input.streak >= 2 || input.unlockedBadgeIds.includes('hot-streak')
  const signalLockActive = input.stats.arcadeRuns >= 1 || input.stats.correctAnswers >= 3

  const boosts: TrackerEventCardState[] = [
    {
      id: 'orbital-window',
      title: '궤도 창 개방',
      description: `해금 구역 ${input.unlockedRegionIds.length}개를 확보해 빠른 탐사 출발 보호막이 강화됩니다.`,
      rewardText: '런 시작 시 보호막 +1',
      status: orbitalWindowActive ? 'active' : 'pending',
    },
    {
      id: 'crew-briefing',
      title: '승무원 브리핑',
      description: `연속 탐사 흐름이 살아 있어 출발 전에 추가 스캐너를 지급합니다.`,
      rewardText: '런 시작 시 스캐너 +1',
      status: crewBriefingActive ? 'active' : 'pending',
    },
    {
      id: 'signal-lock',
      title: `${featuredSatellite.label} 신호 고정`,
      description: `${featuredSatellite.emoji} ${featuredSatellite.label}이 오늘의 추적 대상입니다. 연동 특수 라운드 보정이 적용됩니다.`,
      rewardText: 'tracker-lock 정답 시 +30 점수',
      satellite: featuredSatellite,
      status: signalLockActive ? 'active' : 'pending',
    },
  ]

  return {
    featuredSatellite,
    boosts,
    bonuses: {
      shieldBonus: orbitalWindowActive ? 1 : 0,
      scannerBonus: crewBriefingActive ? 1 : 0,
      trackerLockBonusScore: signalLockActive ? 30 : 0,
      featuredSatellite,
      boosts: boosts.filter((boost) => boost.status === 'active').map(stripBoostStatus),
    },
  }
}

function getFeaturedSatellite(now: Date): TrackerSatelliteMeta {
  const daySeed = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return TRACKED_SATELLITES[Math.floor(daySeed / 86400000) % TRACKED_SATELLITES.length]
}

function stripBoostStatus(boost: TrackerEventCardState): ArcadeTrackerBoost {
  const { status: _status, ...rest } = boost
  return rest
}
