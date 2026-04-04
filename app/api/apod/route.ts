import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? ''
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'

  const url = new URL('https://api.nasa.gov/planetary/apod')
  url.searchParams.set('api_key', apiKey)
  if (date) url.searchParams.set('date', date)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach NASA API' }, { status: 502 })
  }
}
