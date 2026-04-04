import { describe, it, expect, beforeEach } from 'vitest'
import { getQuestion, QUESTION_BANK, clearQuestionCache } from './questions'
import type { APODResponse } from './nasa'

function makeAPOD(overrides: Partial<APODResponse> = {}): APODResponse {
  return {
    date: '2024-01-15',
    title: 'A Beautiful View',
    explanation: 'This is a test explanation.',
    url: 'https://example.com/image.jpg',
    media_type: 'image',
    ...overrides,
  }
}

beforeEach(() => {
  clearQuestionCache()
})

describe('getQuestion', () => {
  it('returns a galaxy question when title contains "galaxy"', () => {
    const apod = makeAPOD({ title: 'The Andromeda Galaxy' })
    const q = getQuestion(apod)
    expect(q.category).toBe('galaxy')
  })

  it('returns a nebula question when explanation contains "nebula"', () => {
    const apod = makeAPOD({ explanation: 'This stunning nebula is a star-forming region.' })
    const q = getQuestion(apod)
    expect(q.category).toBe('nebula')
  })

  it('returns a planet question when title contains "mars"', () => {
    const apod = makeAPOD({ title: 'Mars at Opposition' })
    const q = getQuestion(apod)
    expect(q.category).toBe('planet')
  })

  it('returns a spacecraft question when title contains "hubble"', () => {
    const apod = makeAPOD({ title: 'Hubble Space Telescope Views a Cluster' })
    const q = getQuestion(apod)
    expect(q.category).toBe('spacecraft')
  })

  it('returns a star_cluster question when explanation contains "cluster"', () => {
    const apod = makeAPOD({ explanation: 'A globular cluster of ancient stars.' })
    const q = getQuestion(apod)
    expect(q.category).toBe('star_cluster')
  })

  it('returns a solar_system question when title contains "solar"', () => {
    const apod = makeAPOD({ title: 'Solar Corona During Eclipse' })
    const q = getQuestion(apod)
    expect(q.category).toBe('solar_system')
  })

  it('returns a black_hole question when explanation contains "black hole"', () => {
    const apod = makeAPOD({ explanation: 'Scientists photographed a black hole for the first time.' })
    const q = getQuestion(apod)
    expect(q.category).toBe('black_hole')
  })

  it('returns an unknown question when no keywords match', () => {
    const apod = makeAPOD({ title: 'Something Mysterious', explanation: 'A peculiar phenomenon was observed.' })
    const q = getQuestion(apod)
    expect(q.category).toBe('unknown')
  })

  it('does not throw when explanation is empty string', () => {
    const apod = makeAPOD({ title: 'Spiral Galaxy M51', explanation: '' })
    expect(() => getQuestion(apod)).not.toThrow()
  })

  it('returns a question with 3-4 choices', () => {
    const apod = makeAPOD()
    const q = getQuestion(apod)
    expect(q.choices.length).toBeGreaterThanOrEqual(3)
    expect(q.choices.length).toBeLessThanOrEqual(4)
  })

  it('has a valid correctIndex within choices bounds', () => {
    const apod = makeAPOD()
    const q = getQuestion(apod)
    expect(q.correctIndex).toBeGreaterThanOrEqual(0)
    expect(q.correctIndex).toBeLessThan(q.choices.length)
  })

  it('always returns a non-empty hint', () => {
    const apod = makeAPOD()
    const q = getQuestion(apod)
    expect(q.hint).toBeTruthy()
    expect(q.hint.length).toBeGreaterThan(0)
  })

  it('all questions in QUESTION_BANK have valid correctIndex', () => {
    for (const questions of Object.values(QUESTION_BANK)) {
      for (const q of questions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.choices.length)
      }
    }
  })

  it('all questions in QUESTION_BANK have 3-4 choices', () => {
    for (const questions of Object.values(QUESTION_BANK)) {
      for (const q of questions) {
        expect(q.choices.length).toBeGreaterThanOrEqual(3)
        expect(q.choices.length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('all questions have a non-empty hint', () => {
    for (const questions of Object.values(QUESTION_BANK)) {
      for (const q of questions) {
        expect(q.hint.length).toBeGreaterThan(0)
      }
    }
  })

  it('total question bank has 30+ questions', () => {
    const total = Object.values(QUESTION_BANK).reduce((sum, qs) => sum + qs.length, 0)
    expect(total).toBeGreaterThanOrEqual(30)
  })
})
