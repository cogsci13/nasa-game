import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch ISS position' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach ISS API' }, { status: 502 })
  }
}
