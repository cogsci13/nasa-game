// NASA API client

export interface APODResponse {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
}

export interface MarsPhoto {
  id: number
  sol: number
  camera: {
    id: number
    name: string
    rover_id: number
    full_name: string
  }
  img_src: string
  earth_date: string
  rover: {
    id: number
    name: string
    landing_date: string
    launch_date: string
    status: string
  }
}

export interface MarsPhotosResponse {
  photos: MarsPhoto[]
}

export class NASARateLimitError extends Error {
  constructor(message = 'NASA API rate limit exceeded (429)') {
    super(message)
    this.name = 'NASARateLimitError'
  }
}

export class NASANetworkError extends Error {
  constructor(message = 'Network error while fetching NASA API') {
    super(message)
    this.name = 'NASANetworkError'
  }
}

// Module-level cache: date string -> APODResponse
const apodCache = new Map<string, APODResponse>()

export function clearAPODCache(): void {
  apodCache.clear()
}

export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() - 1)
  return formatDateForAPI(date)
}

export async function fetchAPOD(date?: string, attempt = 0): Promise<APODResponse> {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
  const targetDate = date ?? formatDateForAPI(new Date())

  // Return cached response if available
  const cached = apodCache.get(targetDate)
  if (cached) {
    return cached
  }

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${targetDate}`

  let response: Response
  try {
    response = await fetch(url)
  } catch (err) {
    throw new NASANetworkError(
      `Network error fetching APOD for ${targetDate}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (response.status === 429) {
    throw new NASARateLimitError(`NASA API rate limit exceeded while fetching APOD for ${targetDate}`)
  }

  if (!response.ok) {
    throw new NASANetworkError(`NASA API returned status ${response.status} for date ${targetDate}`)
  }

  const data = (await response.json()) as APODResponse

  // If media_type is video, fall back to previous day (max 3 attempts)
  if (data.media_type === 'video') {
    if (attempt >= 3) {
      throw new NASANetworkError(
        `Exceeded max attempts (3) trying to find an image APOD — all results were videos`
      )
    }
    const prevDay = getPreviousDay(targetDate)
    return fetchAPOD(prevDay, attempt + 1)
  }

  // Cache and return image response
  apodCache.set(targetDate, data)
  return data
}
