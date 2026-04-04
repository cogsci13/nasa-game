'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: string
  timestamp: number
}

const TRAIL_LENGTH = 60

export default function ISSMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const trailRef = useRef<import('leaflet').Polyline | null>(null)
  const positionsRef = useRef<[number, number][]>([])
  const [position, setPosition] = useState<ISSPosition | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    let map: import('leaflet').Map
    let interval: ReturnType<typeof setInterval>

    async function init() {
      const L = (await import('leaflet')).default

      map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
      })

      leafletMapRef.current = map

      // Dark tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 20 }
      ).addTo(map)

      // Custom ISS icon
      const issIcon = L.divIcon({
        html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 0 6px #fff);">🛸</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: '',
      })

      // Trail polyline
      const trail = L.polyline([], {
        color: '#4fc3f7',
        weight: 2,
        opacity: 0.6,
        dashArray: '4 4',
      }).addTo(map)
      trailRef.current = trail

      // Marker
      const marker = L.marker([0, 0], { icon: issIcon }).addTo(map)
      markerRef.current = marker

      async function fetchPosition() {
        try {
          const res = await fetch('/api/iss')
          if (!res.ok) throw new Error()
          const data: ISSPosition = await res.json()
          setPosition(data)
          setError(false)

          const latlng: [number, number] = [data.latitude, data.longitude]
          marker.setLatLng(latlng)

          positionsRef.current = [...positionsRef.current.slice(-(TRAIL_LENGTH - 1)), latlng]
          trail.setLatLngs(positionsRef.current)
        } catch {
          setError(true)
        }
      }

      await fetchPosition()
      interval = setInterval(fetchPosition, 5000)
    }

    init()

    return () => {
      clearInterval(interval)
      leafletMapRef.current?.remove()
      leafletMapRef.current = null
    }
  }, [])

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height: '420px' }} />

      {error && (
        <p className="text-center text-red-400 text-sm">ISS 위치를 가져올 수 없습니다.</p>
      )}

      {position && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="위도" value={`${position.latitude.toFixed(2)}°`} />
          <StatCard label="경도" value={`${position.longitude.toFixed(2)}°`} />
          <StatCard label="고도" value={`${Math.round(position.altitude)} km`} />
          <StatCard label="속도" value={`${Math.round(position.velocity).toLocaleString()} km/h`} />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-sm font-mono font-semibold text-sky-300">{value}</p>
    </div>
  )
}
