import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { getLevel } from '@/types/game'
import type { APODResponse } from '@/lib/nasa'
import type { Question } from '@/lib/questions'

function makeAPOD(): APODResponse {
  return {
    date: '2024-01-15',
    title: 'Test APOD',
    explanation: 'A galaxy appears in this image.',
    url: 'https://example.com/image.jpg',
    media_type: 'image',
  }
}

function makeQuestion(correctIndex = 0): Question {
  return {
    id: 'test-q1',
    text: '이 천체는 무엇인가요?',
    choices: ['은하', '성운', '성단', '행성'],
    correctIndex,
    category: 'galaxy',
    hint: '나선 팔을 찾아보세요',
  }
}

function resetStore() {
  useGameStore.setState({
    xp: 0,
    equipment: { analyzer: { uses: 3 } },
    dailyMission: { date: '', completed: false, streak: 0 },
    currentMission: null,
    lastXPGain: null,
  })
}

describe('gameStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('startDailyMission', () => {
    it('sets currentMission with given apod and question', () => {
      const apod = makeAPOD()
      const question = makeQuestion()
      useGameStore.getState().startDailyMission(apod, question)
      const { currentMission } = useGameStore.getState()
      expect(currentMission).not.toBeNull()
      expect(currentMission?.apodData).toEqual(apod)
      expect(currentMission?.question).toEqual(question)
      expect(currentMission?.selectedIndex).toBeNull()
      expect(currentMission?.isRisk).toBe(false)
      expect(currentMission?.eliminatedChoices).toEqual([])
    })

    it('resets lastXPGain', () => {
      useGameStore.setState({ lastXPGain: 50 })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      expect(useGameStore.getState().lastXPGain).toBeNull()
    })
  })

  describe('submitAnswer', () => {
    it('awards XP_REWARDS.correct (50) on correct normal answer', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(0)  // correct
      expect(useGameStore.getState().xp).toBe(50)
      expect(useGameStore.getState().lastXPGain).toBe(50)
    })

    it('awards no XP on wrong normal answer', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(1)  // wrong
      expect(useGameStore.getState().xp).toBe(0)
      expect(useGameStore.getState().lastXPGain).toBe(0)
    })

    it('awards XP_REWARDS.riskCorrect (120) on risk + correct', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().toggleRisk()
      useGameStore.getState().submitAnswer(0)  // correct
      expect(useGameStore.getState().xp).toBe(120)
    })

    it('deducts XP_REWARDS.riskWrong on risk + wrong', () => {
      useGameStore.setState({ xp: 100 })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().toggleRisk()
      useGameStore.getState().submitAnswer(1)  // wrong
      expect(useGameStore.getState().xp).toBe(80)  // 100 - 20
    })

    it('does not reduce XP below 0', () => {
      useGameStore.setState({ xp: 10 })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().toggleRisk()
      useGameStore.getState().submitAnswer(1)  // wrong, would be -10
      expect(useGameStore.getState().xp).toBe(0)
    })

    it('sets selectedIndex on submission', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(2)
      expect(useGameStore.getState().currentMission?.selectedIndex).toBe(2)
    })

    it('does not submit twice (idempotent after first answer)', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(0)
      const xpAfterFirst = useGameStore.getState().xp
      useGameStore.getState().submitAnswer(0)  // second call should be no-op
      expect(useGameStore.getState().xp).toBe(xpAfterFirst)
    })

    it('returns { correct: true, xpDelta: 50 } on correct normal answer', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useGameStore.getState().submitAnswer(0)
      expect(result.correct).toBe(true)
      expect(result.xpDelta).toBe(50)
    })

    it('marks daily mission as completed', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(0)
      expect(useGameStore.getState().dailyMission.completed).toBe(true)
    })
  })

  describe('level-up trigger', () => {
    it('correctly computes level 2 after 100 XP', () => {
      expect(getLevel(0)).toBe(1)
      expect(getLevel(99)).toBe(1)
      expect(getLevel(100)).toBe(2)
      expect(getLevel(250)).toBe(3)
    })

    it('returns leveledUp: true when XP crosses a threshold', () => {
      useGameStore.setState({ xp: 98 })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useGameStore.getState().submitAnswer(0)  // +50 XP → crosses 100
      expect(result.leveledUp).toBe(true)
    })

    it('returns leveledUp: false when XP does not cross threshold', () => {
      useGameStore.setState({ xp: 0 })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useGameStore.getState().submitAnswer(0)  // 0→50, still Lv1
      expect(result.leveledUp).toBe(false)
    })
  })

  describe('useAnalyzer', () => {
    it('adds one index to eliminatedChoices', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().useAnalyzer()
      const { currentMission } = useGameStore.getState()
      expect(currentMission?.eliminatedChoices).toHaveLength(1)
    })

    it('never eliminates the correct answer', () => {
      for (let i = 0; i < 20; i++) {
        resetStore()
        useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
        useGameStore.getState().useAnalyzer()
        const { currentMission } = useGameStore.getState()
        expect(currentMission?.eliminatedChoices).not.toContain(0)
      }
    })

    it('decrements analyzer uses by 1', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().useAnalyzer()
      expect(useGameStore.getState().equipment.analyzer.uses).toBe(2)
    })

    it('does not work when no uses remain', () => {
      useGameStore.setState({ equipment: { analyzer: { uses: 0 } } })
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().useAnalyzer()
      expect(useGameStore.getState().currentMission?.eliminatedChoices).toHaveLength(0)
    })

    it('does not work after answer submitted', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useGameStore.getState().submitAnswer(0)
      useGameStore.getState().useAnalyzer()
      expect(useGameStore.getState().currentMission?.eliminatedChoices).toHaveLength(0)
    })
  })

  describe('toggleRisk', () => {
    it('toggles isRisk on/off', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      expect(useGameStore.getState().currentMission?.isRisk).toBe(false)
      useGameStore.getState().toggleRisk()
      expect(useGameStore.getState().currentMission?.isRisk).toBe(true)
      useGameStore.getState().toggleRisk()
      expect(useGameStore.getState().currentMission?.isRisk).toBe(false)
    })

    it('does not toggle after answer submitted', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      useGameStore.getState().submitAnswer(0)
      useGameStore.getState().toggleRisk()
      expect(useGameStore.getState().currentMission?.isRisk).toBe(false)
    })
  })

  describe('resetForNewDay', () => {
    it('clears currentMission and lastXPGain', () => {
      useGameStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      useGameStore.setState({ lastXPGain: 50 })
      useGameStore.getState().resetForNewDay()
      expect(useGameStore.getState().currentMission).toBeNull()
      expect(useGameStore.getState().lastXPGain).toBeNull()
    })
  })
})
