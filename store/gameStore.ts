import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { APODResponse } from '@/lib/nasa'
import type { Question } from '@/lib/questions'
import {
  type Equipment,
  type DailyMission,
  type CurrentMission,
  getLevel,
  XP_REWARDS,
} from '@/types/game'

interface GameState {
  // Persistent
  xp: number
  equipment: Equipment
  dailyMission: DailyMission

  // Session (not persisted, reset on hydration)
  currentMission: CurrentMission | null
  lastXPGain: number | null
}

interface GameActions {
  startDailyMission: (apodData: APODResponse, question: Question) => void
  toggleRisk: () => void
  useAnalyzer: () => void
  submitAnswer: (selectedIndex: number) => { correct: boolean; xpDelta: number }
  resetForNewDay: () => void
}

type GameStore = GameState & GameActions

const INITIAL_EQUIPMENT: Equipment = {
  analyzer: { uses: 3 },
}

const INITIAL_DAILY_MISSION: DailyMission = {
  date: '',
  completed: false,
  streak: 0,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // --- State ---
      xp: 0,
      equipment: INITIAL_EQUIPMENT,
      dailyMission: INITIAL_DAILY_MISSION,
      currentMission: null,
      lastXPGain: null,

      // --- Actions ---

      startDailyMission(apodData, question) {
        set({
          currentMission: {
            apodData,
            question,
            selectedIndex: null,
            isRisk: false,
            eliminatedChoices: [],
          },
          lastXPGain: null,
        })
      },

      toggleRisk() {
        const { currentMission } = get()
        if (!currentMission || currentMission.selectedIndex !== null) return
        set({
          currentMission: {
            ...currentMission,
            isRisk: !currentMission.isRisk,
          },
        })
      },

      useAnalyzer() {
        const { currentMission, equipment } = get()
        if (!currentMission) return
        if (equipment.analyzer.uses <= 0) return
        if (currentMission.selectedIndex !== null) return

        const { question, eliminatedChoices } = currentMission
        // Pick one wrong answer to eliminate (not already eliminated, not correct)
        const eligible = question.choices
          .map((_, i) => i)
          .filter((i) => i !== question.correctIndex && !eliminatedChoices.includes(i))

        if (eligible.length === 0) return

        const toEliminate = eligible[Math.floor(Math.random() * eligible.length)]

        set({
          currentMission: {
            ...currentMission,
            eliminatedChoices: [...eliminatedChoices, toEliminate],
          },
          equipment: {
            ...equipment,
            analyzer: { uses: equipment.analyzer.uses - 1 },
          },
        })
      },

      submitAnswer(selectedIndex) {
        const { currentMission, xp, dailyMission } = get()
        if (!currentMission) return { correct: false, xpDelta: 0 }
        if (currentMission.selectedIndex !== null) return { correct: false, xpDelta: 0 }

        const correct = selectedIndex === currentMission.question.correctIndex
        const isRisk = currentMission.isRisk

        let xpDelta = 0
        if (correct) {
          xpDelta = isRisk ? XP_REWARDS.riskCorrect : XP_REWARDS.correct
        } else if (isRisk) {
          xpDelta = XP_REWARDS.riskWrong
        }

        const newXP = Math.max(0, xp + xpDelta)
        const newLevel = getLevel(newXP)
        const oldLevel = getLevel(xp)
        const leveledUp = newLevel > oldLevel

        // Update streak only on correct answer for daily mission
        const today = new Date().toISOString().split('T')[0]
        const isNewDay = dailyMission.date !== today
        const newStreak = correct
          ? isNewDay
            ? dailyMission.streak + 1
            : dailyMission.streak
          : 0

        set({
          xp: newXP,
          lastXPGain: xpDelta,
          currentMission: {
            ...currentMission,
            selectedIndex,
          },
          dailyMission: {
            date: today,
            completed: true,
            streak: newStreak,
          },
        })

        return { correct, xpDelta, leveledUp }
      },

      resetForNewDay() {
        set({ currentMission: null, lastXPGain: null })
      },
    }),
    {
      name: 'nasa-game-storage',
      // Only persist xp, equipment, and dailyMission — not session state
      partialize: (state) => ({
        xp: state.xp,
        equipment: state.equipment,
        dailyMission: state.dailyMission,
      }),
    }
  )
)
