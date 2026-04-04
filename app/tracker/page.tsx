'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const ISSMap = dynamic(() => import('@/components/ISSMap'), { ssr: false })

interface Astronaut {
  name: string
  craft: string
}

const CRAFT_FLAG: Record<string, string> = {
  ISS: '🛸',
  'Tiangong': '🚀',
}

const CRAFT_COLOR: Record<string, string> = {
  ISS: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  Tiangong: 'text-red-300 border-red-500/30 bg-red-500/10',
}

export default function TrackerPage() {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/astronauts')
      .then(r => r.json())
      .then(data => {
        setAstronauts(data.people ?? [])
        setLoading(false)
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
        <ISSMap />
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
          <div className="space-y-6">
            {crafts.map(craft => (
              <div key={craft}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CRAFT_FLAG[craft] ?? '🚀'}</span>
                  <span className="text-sm font-semibold text-white/70">{craft}</span>
                  <span className="text-xs text-white/40">
                    ({astronauts.filter(a => a.craft === craft).length}명)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {astronauts
                    .filter(a => a.craft === craft)
                    .map(a => (
                      <div
                        key={a.name}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium ${CRAFT_COLOR[craft] ?? 'text-white/70 border-white/10 bg-white/5'}`}
                      >
                        {a.name}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Update note */}
      <p className="text-center text-white/25 text-xs mt-10">위치는 5초마다 자동 업데이트됩니다</p>
    </main>
  )
}
