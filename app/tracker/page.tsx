'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ProgressHUD from '@/components/game/ProgressHUD'
import { getCollectionBadges, getUnlockedRegions } from '@/lib/game/progression'
import { getTrackerEventState } from '@/lib/game/trackerEvents'
import { useMetaStore } from '@/store/metaStore'
import { getLevel } from '@/types/meta'

const SatelliteMap = dynamic(() => import('@/components/SatelliteMap'), { ssr: false })

interface Astronaut {
  name: string
  craft: string
}

interface WikiInfo {
  url: string | null
  thumbnail: string | null
  extract: string | null
}

const CRAFT_FLAG: Record<string, string> = {
  ISS: '🛸',
  Tiangong: '🚀',
}

const CRAFT_STYLE: Record<string, string> = {
  ISS: 'border-sky-500/30 bg-sky-500/5',
  Tiangong: 'border-red-500/30 bg-red-500/5',
}

const CRAFT_BADGE: Record<string, string> = {
  ISS: 'text-sky-300 bg-sky-500/20',
  Tiangong: 'text-red-300 bg-red-500/20',
}

export default function TrackerPage() {
  const xp = useMetaStore((state) => state.xp)
  const streak = useMetaStore((state) => state.dailyMission.streak)
  const analyzerUses = useMetaStore((state) => state.equipment.analyzer.uses)
  const stats = useMetaStore((state) => state.stats)
  const unlockedRegionIds = useMetaStore((state) => state.unlockedRegionIds)
  const unlockedBadgeIds = useMetaStore((state) => state.unlockedBadgeIds)

  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [wikiMap, setWikiMap] = useState<Record<string, WikiInfo>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/astronauts')
      .then(r => r.json())
      .then(async data => {
        const people: Astronaut[] = data.people ?? []
        setAstronauts(people)
        setLoading(false)

        // Fetch Wikipedia info for each astronaut in parallel
        const entries = await Promise.all(
          people.map(async a => {
            try {
              const res = await fetch(`/api/wiki?name=${encodeURIComponent(a.name)}`)
              if (!res.ok) return [a.name, { url: null, thumbnail: null, extract: null }]
              const info: WikiInfo = await res.json()
              return [a.name, info]
            } catch {
              return [a.name, { url: null, thumbnail: null, extract: null }]
            }
          })
        )
        setWikiMap(Object.fromEntries(entries))
      })
      .catch(() => setLoading(false))
  }, [])

  const crafts = Array.from(new Set(astronauts.map(a => a.craft)))
  const level = getLevel(xp)
  const unlockedRegions = getUnlockedRegions(xp)
  const unlockedBadges = getCollectionBadges(unlockedBadgeIds).filter((badge) => badge.unlocked)
  const trackerState = getTrackerEventState({
    xp,
    streak,
    stats,
    unlockedRegionIds,
    unlockedBadgeIds,
  })
  const trackerEvents = [
    {
      id: 'live-pass',
      title: '저궤도 패스 감지',
      description: `실시간 위성 ${3}기와 현재 우주 인원 ${astronauts.length}명을 동기화해 이벤트 패널을 갱신합니다.`,
      rewardText: '트래커 보드 갱신',
      status: astronauts.length > 0 ? 'active' : 'pending',
    },
    ...trackerState.boosts,
  ] as const

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <ProgressHUD />
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-bold text-white mb-1">🛸 실시간 추적 허브</h1>
            <p className="text-white/50 text-sm">
              위성 위치와 탑승 우주인 데이터를 현재 진행도와 함께 확인하는 이벤트 패널입니다.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">Tracker Sync</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TrackerStat label="해금 구역" value={`${unlockedRegions.length}`} accent="#60a5fa" />
              <TrackerStat label="획득 배지" value={`${unlockedBadges.length}`} accent="#86efac" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">오늘의 추적 대상</p>
              <p className="mt-2 text-sm font-bold text-white">
                {trackerState.featuredSatellite.emoji} {trackerState.featuredSatellite.label}
              </p>
              <p className="mt-1 text-xs text-white/50">
                빠른 탐사 `tracker-lock` 특수 라운드가 이 대상과 연결됩니다.
              </p>
            </div>
          </div>
        </div>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SatelliteMap />
            <p className="text-center text-white/25 text-xs mt-4">위치는 5초마다 자동 업데이트됩니다</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">Live Events</p>
            <div className="mt-4 space-y-3">
              {trackerEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{event.title}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        event.status === 'active'
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-white/8 text-white/45'
                      }`}
                    >
                      {event.status === 'active' ? '활성' : '대기'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/55">{event.description}</p>
                  <p className="mt-3 text-xs font-semibold text-[#FF6B35]">{event.rewardText}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            👨‍🚀 지금 우주에 있는 사람들
            {!loading && (
              <span className="ml-2 text-sm font-normal text-white/50">{astronauts.length}명</span>
            )}
          </h2>

          {loading ? (
            <p className="text-white/40 text-sm text-center py-8">불러오는 중...</p>
          ) : astronauts.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">데이터를 가져올 수 없습니다.</p>
          ) : (
            <div className="space-y-8">
              {crafts.map(craft => (
                <div key={craft}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{CRAFT_FLAG[craft] ?? '🚀'}</span>
                    <span className="text-sm font-semibold text-white/70">{craft}</span>
                    <span className="text-xs text-white/40">
                      ({astronauts.filter(a => a.craft === craft).length}명)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {astronauts
                      .filter(a => a.craft === craft)
                      .map(a => {
                        const wiki = wikiMap[a.name]
                        return (
                          <AstronautCard
                            key={a.name}
                            name={a.name}
                            craft={craft}
                            wiki={wiki}
                            craftStyle={CRAFT_STYLE[craft] ?? 'border-white/10 bg-white/5'}
                            badgeStyle={CRAFT_BADGE[craft] ?? 'text-white/60 bg-white/10'}
                          />
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function TrackerStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

function AstronautCard({
  name,
  craft,
  wiki,
  craftStyle,
  badgeStyle,
}: {
  name: string
  craft: string
  wiki: WikiInfo | undefined
  craftStyle: string
  badgeStyle: string
}) {
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${craftStyle}`}>
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
        {wiki?.thumbnail ? (
          <Image
            src={wiki.thumbnail}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-2xl">👨‍🚀</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white leading-tight">{name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badgeStyle}`}>
            {craft}
          </span>
        </div>

        {wiki?.extract && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-2">
            {wiki.extract}
          </p>
        )}

        {wiki?.url ? (
          <a
            href={wiki.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            Wikipedia →
          </a>
        ) : wiki !== undefined ? (
          <span className="text-xs text-white/25">정보 없음</span>
        ) : (
          <span className="text-xs text-white/25">검색 중...</span>
        )}
      </div>
    </div>
  )
}
