import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const encoded = encodeURIComponent(name.replace(/ /g, '_'))
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nasa-game/1.0' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const data = await res.json()
    return NextResponse.json({
      url: data.content_urls?.desktop?.page ?? null,
      thumbnail: data.thumbnail?.source ?? null,
      extract: data.extract ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach Wikipedia' }, { status: 502 })
  }
}
