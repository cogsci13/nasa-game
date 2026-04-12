import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAPOD,
  clearAPODCache,
  formatDateForAPI,
  NASARateLimitError,
  NASANetworkError,
  NASAAPIError,
  type APODResponse,
} from './nasa'

const makeImageAPOD = (date = '2024-01-15'): APODResponse => ({
  date,
  title: 'A Beautiful Nebula',
  explanation: 'This is a test explanation.',
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/test_hd.jpg',
  media_type: 'image',
  copyright: 'Test Author',
})

const makeVideoAPOD = (date = '2024-01-15'): APODResponse => ({
  date,
  title: 'A Space Video',
  explanation: 'This is a video explanation.',
  url: 'https://www.youtube.com/watch?v=test',
  media_type: 'video',
})

beforeEach(() => {
  clearAPODCache()
  vi.restoreAllMocks()
})

describe('formatDateForAPI', () => {
  it('formats a known UTC date correctly', () => {
    const date = new Date('2024-01-15T00:00:00Z')
    expect(formatDateForAPI(date)).toBe('2024-01-15')
  })

  it('uses UTC date, not local time', () => {
    // 2024-01-15T00:30:00Z is still Jan 15 in UTC regardless of local timezone
    const date = new Date('2024-01-15T00:30:00Z')
    expect(formatDateForAPI(date)).toBe('2024-01-15')
  })
})

describe('fetchAPOD', () => {
  it('happy path: returns image APOD and caches the response', async () => {
    const apod = makeImageAPOD('2024-01-15')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => apod,
      })
    )

    const result = await fetchAPOD('2024-01-15')
    expect(result).toEqual(apod)
    expect(result.media_type).toBe('image')

    // Verify cached: calling again should not invoke fetch again
    const result2 = await fetchAPOD('2024-01-15')
    expect(result2).toEqual(apod)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('video fallback: retries previous day when first response is a video', async () => {
    const videoApod = makeVideoAPOD('2024-01-15')
    const imageApod = makeImageAPOD('2024-01-14')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => videoApod,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => imageApod,
        })
    )

    const result = await fetchAPOD('2024-01-15')
    expect(result).toEqual(imageApod)
    expect(result.media_type).toBe('image')
    expect(fetch).toHaveBeenCalledTimes(2)

    // Verify the second call was for the previous day
    const calls = vi.mocked(fetch).mock.calls
    expect(calls[0][0]).toContain('date=2024-01-15')
    expect(calls[1][0]).toContain('date=2024-01-14')
  })

  it('video-day result is cached under the original requested date', async () => {
    const videoApod = makeVideoAPOD('2024-01-15')
    const imageApod = makeImageAPOD('2024-01-14')

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => videoApod,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => imageApod,
      })

    vi.stubGlobal('fetch', mockFetch)

    // First call: fetches twice (video + fallback image)
    const result1 = await fetchAPOD('2024-01-15')
    expect(result1).toEqual(imageApod)
    expect(mockFetch).toHaveBeenCalledTimes(2)

    // Second call for the same video date: should be a cache hit, no new fetch
    const result2 = await fetchAPOD('2024-01-15')
    expect(result2).toEqual(imageApod)
    expect(mockFetch).toHaveBeenCalledTimes(2) // still 2, no additional fetch
  })

  it('throws NASARateLimitError on 429 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'rate limited' }),
      })
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASARateLimitError)
    expect((err as NASARateLimitError).message).toMatch(/rate limit/i)
  })

  it('throws NASAAPIError on non-OK HTTP responses (e.g. 500)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'internal server error' }),
      })
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASAAPIError)
    expect((err as NASAAPIError).status).toBe(500)
    expect((err as NASAAPIError).message).toMatch(/500/)
  })

  it('falls back to the previous day on 404 response', async () => {
    const fallbackApod = makeImageAPOD('2024-01-14')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'not found' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => fallbackApod,
        })
    )

    const result = await fetchAPOD('2024-01-15')
    expect(result).toEqual(fallbackApod)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws NASAAPIError after repeated 404 responses exhaust retries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'not found' }),
      })
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASAAPIError)
    expect((err as NASAAPIError).status).toBe(404)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('throws NASANetworkError on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASANetworkError)
    expect((err as NASANetworkError).message).toMatch(/network error/i)
  })

  it('throws NASANetworkError on malformed JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token')
        },
      })
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASANetworkError)
    expect((err as NASANetworkError).message).toMatch(/parse JSON/i)
  })

  it('caching: same date called twice only triggers one fetch call', async () => {
    const apod = makeImageAPOD('2024-01-15')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => apod,
      })
    )

    const first = await fetchAPOD('2024-01-15')
    const second = await fetchAPOD('2024-01-15')

    expect(first).toEqual(second)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('throws NASANetworkError after max 3 video fallback attempts', async () => {
    const videoApod = makeVideoAPOD()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => videoApod,
      })
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASANetworkError)
    expect((err as NASANetworkError).message).toMatch(/exceeded max attempts/i)
    // 4 calls: attempt 0, 1, 2, 3 (then throws)
    expect(fetch).toHaveBeenCalledTimes(4)
  })
})
