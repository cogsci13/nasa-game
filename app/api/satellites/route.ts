import { NextResponse } from 'next/server'

export const TRACKED_SATELLITES = [
  { id: 25544, name: 'ISS', label: '국제우주정거장', emoji: '🛸', color: '#4fc3f7' },
  { id: 20580, name: 'Hubble', label: '허블 우주망원경', emoji: '🔭', color: '#ce93d8' },
  { id: 48274, name: 'Tiangong', label: '텐궁 (중국 우주정거장)', emoji: '🚀', color: '#ef9a9a' },
]

export interface SatellitePosition {
  id: number
  name: string
  label: string
  emoji: string
  color: string
  latitude: number
  longitude: number
  altitude: number
}

export async function GET() {
  const apiKey = process.env.N2YO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'N2YO_API_KEY not configured' }, { status: 500 })
  }

  const results = await Promise.all(
    TRACKED_SATELLITES.map(async sat => {
      const url = `https://api.n2yo.com/rest/v1/satellite/positions/${sat.id}/0/0/0/1&apiKey=${apiKey}`
      try {
        const res = await fetch(url, { next: { revalidate: 0 } })
        if (!res.ok) return null
        const data = await res.json()
        const pos = data.positions?.[0]
        if (!pos) return null
        return {
          ...sat,
          latitude: pos.satlatitude as number,
          longitude: pos.satlongitude as number,
          altitude: Math.round(pos.sataltitude as number),
        } satisfies SatellitePosition
      } catch {
        return null
      }
    })
  )

  return NextResponse.json(results.filter(Boolean))
}
