'use client'

import { useEffect, useRef, useState } from 'react'
import type { SatellitePosition } from '@/app/api/satellites/route'

const TRAIL_LENGTH = 60

export default function SatelliteMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<number, import('leaflet').Marker>>(new Map())
  const trailsRef = useRef<Map<number, import('leaflet').Polyline>>(new Map())
  const trailDataRef = useRef<Map<number, [number, number][]>>(new Map())
  const [satellites, setSatellites] = useState<SatellitePosition[]>([])
  const [selected, setSelected] = useState<SatellitePosition | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function init() {
      const L = (await import('leaflet')).default
      if (cancelled || !containerRef.current) return

      // StrictMode double-invoke: Leaflet leaves _leaflet_id on the DOM node.
      // Delete it so the second mount can initialize cleanly.
      const el = containerRef.current as HTMLElement & { _leaflet_id?: number }
      if (el._leaflet_id) delete el._leaflet_id

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
        worldCopyJump: true,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      // Recalculate after paint so tiles cover the full container
      setTimeout(() => { if (!cancelled) map.invalidateSize() }, 200)

      async function fetchAndUpdate() {
        if (cancelled) return
        try {
          const res = await fetch('/api/satellites')
          if (!res.ok) throw new Error()
          const data: SatellitePosition[] = await res.json()
          if (cancelled) return

          setSatellites(data)
          setError(false)

          for (const sat of data) {
            const latlng: [number, number] = [sat.latitude, sat.longitude]

            // Trail
            const prev = trailDataRef.current.get(sat.id) ?? []
            const updated = [...prev.slice(-(TRAIL_LENGTH - 1)), latlng]
            trailDataRef.current.set(sat.id, updated)

            if (!trailsRef.current.has(sat.id)) {
              const trail = L.polyline(updated, {
                color: sat.color, weight: 2, opacity: 0.5, dashArray: '4 4',
              }).addTo(map)
              trailsRef.current.set(sat.id, trail)
            } else {
              trailsRef.current.get(sat.id)!.setLatLngs(updated)
            }

            // Marker
            if (!markersRef.current.has(sat.id)) {
              const icon = L.divIcon({
                html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 0 5px ${sat.color});" title="${sat.label}">${sat.emoji}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                className: '',
              })
              const marker = L.marker(latlng, { icon })
                .addTo(map)
                .on('click', () => setSelected(s => s?.id === sat.id ? null : sat))
              markersRef.current.set(sat.id, marker)
            } else {
              markersRef.current.get(sat.id)!.setLatLng(latlng)
            }
          }

          setSelected(prev => prev ? (data.find(s => s.id === prev.id) ?? null) : null)
        } catch {
          if (!cancelled) setError(true)
        }
      }

      await fetchAndUpdate()
      if (!cancelled) intervalId = setInterval(fetchAndUpdate, 5000)
    }

    init()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
      trailsRef.current.clear()
      trailDataRef.current.clear()
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Wrapper handles border-radius; map div must NOT have overflow-hidden */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div ref={containerRef} style={{ height: '420px', width: '100%' }} />
      </div>

      {error && (
        <p className="text-center text-red-400 text-sm">위성 위치를 가져올 수 없습니다.</p>
      )}

      {satellites.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {satellites.map(sat => (
            <button
              key={sat.id}
              onClick={() => setSelected(s => s?.id === sat.id ? null : sat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors"
              style={{
                borderColor: selected?.id === sat.id ? sat.color : 'rgba(255,255,255,0.1)',
                backgroundColor: selected?.id === sat.id ? `${sat.color}20` : 'transparent',
                color: selected?.id === sat.id ? sat.color : 'rgba(255,255,255,0.5)',
              }}
            >
              <span>{sat.emoji}</span>
              <span>{sat.name}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold mb-3" style={{ color: selected.color }}>
            {selected.emoji} {selected.label}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="위도" value={`${selected.latitude.toFixed(2)}°`} color={selected.color} />
            <StatCard label="경도" value={`${selected.longitude.toFixed(2)}°`} color={selected.color} />
            <StatCard label="고도" value={`${selected.altitude} km`} color={selected.color} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-sm font-mono font-semibold" style={{ color }}>{value}</p>
    </div>
  )
}
