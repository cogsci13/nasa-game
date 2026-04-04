'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { SatellitePosition } from '@/app/api/satellites/route'

const TRAIL_LENGTH = 60

type TrailEntry = { id: number; positions: [number, number][] }

export default function SatelliteMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<number, import('leaflet').Marker>>(new Map())
  const trailsRef = useRef<Map<number, import('leaflet').Polyline>>(new Map())
  const trailDataRef = useRef<Map<number, [number, number][]>>(new Map())
  const [satellites, setSatellites] = useState<SatellitePosition[]>([])
  const [selected, setSelected] = useState<SatellitePosition | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    let interval: ReturnType<typeof setInterval>

    async function init() {
      const L = (await import('leaflet')).default

      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
      })
      leafletMapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      async function fetchAndUpdate() {
        try {
          const res = await fetch('/api/satellites')
          if (!res.ok) throw new Error()
          const data: SatellitePosition[] = await res.json()
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
                color: sat.color,
                weight: 2,
                opacity: 0.5,
                dashArray: '4 4',
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
                .on('click', () => {
                  setSelected(s => (s?.id === sat.id ? null : sat))
                })
              markersRef.current.set(sat.id, marker)
            } else {
              markersRef.current.get(sat.id)!.setLatLng(latlng)
            }
          }

          // Keep selected in sync with latest data
          setSelected(prev => prev ? (data.find(s => s.id === prev.id) ?? null) : null)
        } catch {
          setError(true)
        }
      }

      await fetchAndUpdate()
      interval = setInterval(fetchAndUpdate, 5000)
    }

    init()

    return () => {
      clearInterval(interval)
      leafletMapRef.current?.remove()
      leafletMapRef.current = null
      markersRef.current.clear()
      trailsRef.current.clear()
      trailDataRef.current.clear()
    }
  }, [])

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height: '420px' }} />

      {error && (
        <p className="text-center text-red-400 text-sm">위성 위치를 가져올 수 없습니다.</p>
      )}

      {/* Legend */}
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

      {/* Selected satellite stats */}
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
