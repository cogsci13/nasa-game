'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'

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

  return (
    <main className="relative z-10 min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">🛸 실시간 ISS 트래커</h1>
        <p className="text-white/50 text-sm">국제 우주정거장의 현재 위치와 탑승 우주인을 확인하세요</p>
      </div>

      {/* Map */}
      <section className="mb-8">
        <SatelliteMap />
      </section>

      {/* Astronauts */}
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

      <p className="text-center text-white/25 text-xs mt-10">위치는 5초마다 자동 업데이트됩니다</p>
    </main>
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
