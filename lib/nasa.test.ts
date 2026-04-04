import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAPOD,
  clearAPODCache,
  NASARateLimitError,
  NASANetworkError,
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

  it('throws NASANetworkError on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    )

    const err = await fetchAPOD('2024-01-15').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NASANetworkError)
    expect((err as NASANetworkError).message).toMatch(/network error/i)
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
