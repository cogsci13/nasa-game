import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_META_STATE, useMetaStore } from './metaStore'
import { INITIAL_RUN_STATE, useRunStore } from './runStore'
import { getLevel } from '@/types/meta'
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

function resetStores() {
  useMetaStore.setState({
    ...INITIAL_META_STATE,
    equipment: { analyzer: { uses: 3 } },
    dailyMission: { date: '', completed: false, streak: 0 },
  })
  useRunStore.setState({
    ...INITIAL_RUN_STATE,
    currentMission: null,
    lastXPGain: null,
  })
}

describe('daily stores', () => {
  beforeEach(() => {
    resetStores()
  })

  describe('startDailyMission', () => {
    it('sets currentMission with given apod and question', () => {
      const apod = makeAPOD()
      const question = makeQuestion()
      useRunStore.getState().startDailyMission(apod, question)
      const { currentMission } = useRunStore.getState()
      expect(currentMission).not.toBeNull()
      expect(currentMission?.apodData).toEqual(apod)
      expect(currentMission?.question).toEqual(question)
      expect(currentMission?.selectedIndex).toBeNull()
      expect(currentMission?.isRisk).toBe(false)
      expect(currentMission?.eliminatedChoices).toEqual([])
    })

    it('resets lastXPGain', () => {
      useRunStore.setState({ lastXPGain: 50 })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      expect(useRunStore.getState().lastXPGain).toBeNull()
    })
  })

  describe('submitAnswer', () => {
    it('awards XP_REWARDS.correct (50) on correct normal answer', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(0)
      expect(useMetaStore.getState().xp).toBe(50)
      expect(useRunStore.getState().lastXPGain).toBe(50)
    })

    it('awards no XP on wrong normal answer', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(1)
      expect(useMetaStore.getState().xp).toBe(0)
      expect(useRunStore.getState().lastXPGain).toBe(0)
    })

    it('awards XP_REWARDS.riskCorrect (120) on risk + correct', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().toggleRisk()
      useRunStore.getState().submitAnswer(0)
      expect(useMetaStore.getState().xp).toBe(120)
    })

    it('deducts XP_REWARDS.riskWrong on risk + wrong', () => {
      useMetaStore.setState({ xp: 100 })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().toggleRisk()
      useRunStore.getState().submitAnswer(1)
      expect(useMetaStore.getState().xp).toBe(80)
    })

    it('does not reduce XP below 0', () => {
      useMetaStore.setState({ xp: 10 })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().toggleRisk()
      useRunStore.getState().submitAnswer(1)
      expect(useMetaStore.getState().xp).toBe(0)
    })

    it('sets selectedIndex on submission', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(2)
      expect(useRunStore.getState().currentMission?.selectedIndex).toBe(2)
    })

    it('does not submit twice (idempotent after first answer)', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(0)
      const xpAfterFirst = useMetaStore.getState().xp
      useRunStore.getState().submitAnswer(0)
      expect(useMetaStore.getState().xp).toBe(xpAfterFirst)
    })

    it('returns { correct: true, xpDelta: 50 } on correct normal answer', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useRunStore.getState().submitAnswer(0)
      expect(result.correct).toBe(true)
      expect(result.xpDelta).toBe(50)
    })

    it('marks daily mission as completed', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(0)
      expect(useMetaStore.getState().dailyMission.completed).toBe(true)
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
      useMetaStore.setState({ xp: 98 })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useRunStore.getState().submitAnswer(0)
      expect(result.leveledUp).toBe(true)
    })

    it('returns leveledUp: false when XP does not cross threshold', () => {
      useMetaStore.setState({ xp: 0 })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      const result = useRunStore.getState().submitAnswer(0)
      expect(result.leveledUp).toBe(false)
    })
  })

  describe('useAnalyzer', () => {
    it('adds one index to eliminatedChoices', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().useAnalyzer()
      const { currentMission } = useRunStore.getState()
      expect(currentMission?.eliminatedChoices).toHaveLength(1)
    })

    it('never eliminates the correct answer', () => {
      for (let i = 0; i < 20; i++) {
        resetStores()
        useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
        useRunStore.getState().useAnalyzer()
        const { currentMission } = useRunStore.getState()
        expect(currentMission?.eliminatedChoices).not.toContain(0)
      }
    })

    it('decrements analyzer uses by 1', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().useAnalyzer()
      expect(useMetaStore.getState().equipment.analyzer.uses).toBe(2)
    })

    it('does not work when no uses remain', () => {
      useMetaStore.setState({ equipment: { analyzer: { uses: 0 } } })
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().useAnalyzer()
      expect(useRunStore.getState().currentMission?.eliminatedChoices).toHaveLength(0)
    })

    it('does not work after answer submitted', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion(0))
      useRunStore.getState().submitAnswer(0)
      useRunStore.getState().useAnalyzer()
      expect(useRunStore.getState().currentMission?.eliminatedChoices).toHaveLength(0)
    })
  })

  describe('toggleRisk', () => {
    it('toggles isRisk on/off', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      expect(useRunStore.getState().currentMission?.isRisk).toBe(false)
      useRunStore.getState().toggleRisk()
      expect(useRunStore.getState().currentMission?.isRisk).toBe(true)
      useRunStore.getState().toggleRisk()
      expect(useRunStore.getState().currentMission?.isRisk).toBe(false)
    })

    it('does not toggle after answer submitted', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      useRunStore.getState().submitAnswer(0)
      useRunStore.getState().toggleRisk()
      expect(useRunStore.getState().currentMission?.isRisk).toBe(false)
    })
  })

  describe('resetForNewDay', () => {
    it('clears currentMission and lastXPGain', () => {
      useRunStore.getState().startDailyMission(makeAPOD(), makeQuestion())
      useRunStore.setState({ lastXPGain: 50 })
      useRunStore.getState().resetForNewDay()
      expect(useRunStore.getState().currentMission).toBeNull()
      expect(useRunStore.getState().lastXPGain).toBeNull()
    })
  })
})
