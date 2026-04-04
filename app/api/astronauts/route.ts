import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('http://api.open-notify.org/astros.json', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch astronauts' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach Open Notify API' }, { status: 502 })
  }
}
