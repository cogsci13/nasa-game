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

// Fix #3: New error class for non-OK HTTP responses (4xx/5xx that aren't 429)
export class NASAAPIError extends Error {
  status: number
  constructor(status: number, message = `NASA API returned HTTP ${status}`) {
    super(message)
    this.name = 'NASAAPIError'
    this.status = status
  }
}

// Module-level cache: date string -> APODResponse
const apodCache = new Map<string, APODResponse>()

export function clearAPODCache(): void {
  apodCache.clear()
}

// Fix #4: Use UTC methods to match getPreviousDay's UTC behavior
export function formatDateForAPI(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() - 1)
  return formatDateForAPI(date)
}

// Fix #2: Internal recursive function, not exported
async function fetchAPODWithRetry(
  date: string,
  originalDate: string,
  attempt: number
): Promise<APODResponse> {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'

  // Return cached response if available
  const cached = apodCache.get(date)
  if (cached) {
    return cached
  }

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`

  let response: Response
  try {
    response = await fetch(url)
  } catch (err) {
    // Fix #3: fetch() rejection = NASANetworkError
    throw new NASANetworkError(
      `Network error fetching APOD for ${date}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (response.status === 429) {
    throw new NASARateLimitError(`NASA API rate limit exceeded while fetching APOD for ${date}`)
  }

  if (!response.ok) {
    // Fix #3: Non-OK HTTP responses use NASAAPIError
    throw new NASAAPIError(
      response.status,
      `NASA API returned status ${response.status} for date ${date}`
    )
  }

  // Fix #5: Guard response.json() against malformed JSON
  let data: APODResponse
  try {
    data = (await response.json()) as APODResponse
  } catch (err) {
    throw new NASANetworkError(
      `Failed to parse JSON response from NASA API for date ${date}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  // If media_type is video, fall back to previous day (max 3 attempts)
  if (data.media_type === 'video') {
    if (attempt >= 3) {
      throw new NASANetworkError(
        `Exceeded max attempts (3) trying to find an image APOD — all results were videos`
      )
    }
    const prevDay = getPreviousDay(date)
    // Fix #1: Pass originalDate through so we can cache under it too
    const result = await fetchAPODWithRetry(prevDay, originalDate, attempt + 1)
    // Fix #1: Also cache result under the originally requested date
    apodCache.set(originalDate, result)
    return result
  }

  // Cache and return image response
  apodCache.set(date, data)
  // Fix #1: If date differs from originalDate (shouldn't happen here, but be safe), also cache under originalDate
  if (date !== originalDate) {
    apodCache.set(originalDate, data)
  }
  return data
}

// Fix #2: Public wrapper with no `attempt` param
export async function fetchAPOD(date?: string): Promise<APODResponse> {
  const targetDate = date ?? formatDateForAPI(new Date())

  // Return cached response if available (fast path before entering recursion)
  const cached = apodCache.get(targetDate)
  if (cached) {
    return cached
  }

  return fetchAPODWithRetry(targetDate, targetDate, 0)
}
