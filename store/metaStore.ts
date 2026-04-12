import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { deriveUnlockedBadges, deriveUnlockedRegions } from '@/lib/game/progression'
import {
  claimWeeklyGoalReward,
  createWeeklyGoalsState,
  syncWeeklyGoalsWithStats,
} from '@/lib/game/weeklyGoals'
import type {
  ArcadeRunRecord,
  BadgeId,
  DailyMission,
  Equipment,
  ProgressStats,
  Region,
  WeeklyGoalId,
  WeeklyGoalsState,
} from '@/types/meta'

export interface MetaState {
  xp: number
  equipment: Equipment
  dailyMission: DailyMission
  stats: ProgressStats
  unlockedRegionIds: Region[]
  unlockedBadgeIds: BadgeId[]
  weeklyGoals: WeeklyGoalsState
  recentArcadeRuns: ArcadeRunRecord[]
}

export interface MetaActions {
  setXP: (xp: number) => void
  setEquipment: (equipment: Equipment) => void
  setDailyMission: (dailyMission: DailyMission) => void
  patchDailyMission: (patch: Partial<DailyMission>) => void
  recordDailyMissionCompletion: (input: { correct: boolean }) => void
  recordArcadeAnswer: (input: { correct: boolean }) => void
  recordArcadeRun: (input: {
    score: number
    perfect: boolean
    bestCombo: number
    specialSuccesses: number
  }) => void
  recordArcadeRunRecord: (record: ArcadeRunRecord) => void
  claimWeeklyGoal: (goalId: WeeklyGoalId) => number
  syncProgression: () => void
  resetMetaProgress: () => void
}

export type MetaStore = MetaState & MetaActions

export const INITIAL_EQUIPMENT: Equipment = {
  analyzer: { uses: 3 },
}

export const INITIAL_DAILY_MISSION: DailyMission = {
  date: '',
  completed: false,
  streak: 0,
}

export const INITIAL_PROGRESS_STATS: ProgressStats = {
  dailyCompletions: 0,
  arcadeRuns: 0,
  perfectRuns: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  bestArcadeScore: 0,
  bestArcadeCombo: 0,
  bestSpecialSuccesses: 0,
}

function deriveProgressionState(input: {
  xp: number
  dailyMission: DailyMission
  stats: ProgressStats
}): Pick<MetaState, 'unlockedRegionIds' | 'unlockedBadgeIds'> {
  return {
    unlockedRegionIds: deriveUnlockedRegions(input.xp),
    unlockedBadgeIds: deriveUnlockedBadges({
      xp: input.xp,
      streak: input.dailyMission.streak,
      stats: input.stats,
    }),
  }
}

const INITIAL_PROGRESSION_STATE = deriveProgressionState({
  xp: 0,
  dailyMission: INITIAL_DAILY_MISSION,
  stats: INITIAL_PROGRESS_STATS,
})

const INITIAL_WEEKLY_GOALS = createWeeklyGoalsState()

export const INITIAL_META_STATE: MetaState = {
  xp: 0,
  equipment: INITIAL_EQUIPMENT,
  dailyMission: INITIAL_DAILY_MISSION,
  stats: INITIAL_PROGRESS_STATS,
  ...INITIAL_PROGRESSION_STATE,
  weeklyGoals: INITIAL_WEEKLY_GOALS,
  recentArcadeRuns: [],
}

export const useMetaStore = create<MetaStore>()(
  persist(
    (set) => ({
      ...INITIAL_META_STATE,
      setXP: (xp) =>
        set((state) => ({
          xp,
          ...deriveProgressionState({
            xp,
            dailyMission: state.dailyMission,
            stats: state.stats,
          }),
        })),
      setEquipment: (equipment) => set({ equipment }),
      setDailyMission: (dailyMission) =>
        set((state) => ({
          dailyMission,
          ...deriveProgressionState({
            xp: state.xp,
            dailyMission,
            stats: state.stats,
          }),
        })),
      patchDailyMission: (patch) =>
        set((state) => ({
          dailyMission: { ...state.dailyMission, ...patch },
          ...deriveProgressionState({
            xp: state.xp,
            dailyMission: { ...state.dailyMission, ...patch },
            stats: state.stats,
          }),
        })),
      recordDailyMissionCompletion: ({ correct }) =>
        set((state) => {
          const stats: ProgressStats = {
            ...state.stats,
            dailyCompletions: state.stats.dailyCompletions + 1,
            correctAnswers: state.stats.correctAnswers + (correct ? 1 : 0),
            wrongAnswers: state.stats.wrongAnswers + (correct ? 0 : 1),
          }
          const weeklyGoals = syncWeeklyGoalsWithStats(state.weeklyGoals, stats)

          return {
            stats,
            ...deriveProgressionState({
              xp: state.xp,
              dailyMission: state.dailyMission,
              stats,
            }),
            weeklyGoals,
          }
        }),
      recordArcadeAnswer: ({ correct }) =>
        set((state) => {
          const stats: ProgressStats = {
            ...state.stats,
            correctAnswers: state.stats.correctAnswers + (correct ? 1 : 0),
            wrongAnswers: state.stats.wrongAnswers + (correct ? 0 : 1),
          }
          const weeklyGoals = syncWeeklyGoalsWithStats(state.weeklyGoals, stats)

          return {
            stats,
            ...deriveProgressionState({
              xp: state.xp,
              dailyMission: state.dailyMission,
              stats,
            }),
            weeklyGoals,
          }
        }),
      recordArcadeRun: ({ score, perfect, bestCombo, specialSuccesses }) =>
        set((state) => {
          const stats: ProgressStats = {
            ...state.stats,
            arcadeRuns: state.stats.arcadeRuns + 1,
            perfectRuns: state.stats.perfectRuns + (perfect ? 1 : 0),
            bestArcadeScore: Math.max(state.stats.bestArcadeScore, score),
            bestArcadeCombo: Math.max(state.stats.bestArcadeCombo, bestCombo),
            bestSpecialSuccesses: Math.max(
              state.stats.bestSpecialSuccesses,
              specialSuccesses
            ),
          }
          const weeklyGoals = syncWeeklyGoalsWithStats(state.weeklyGoals, stats)

          return {
            stats,
            ...deriveProgressionState({
              xp: state.xp,
              dailyMission: state.dailyMission,
              stats,
            }),
            weeklyGoals,
          }
        }),
      recordArcadeRunRecord: (record) =>
        set((state) => ({
          recentArcadeRuns: [record, ...state.recentArcadeRuns].slice(0, 8),
        })),
      claimWeeklyGoal: (goalId) => {
        const state = useMetaStore.getState()
        const { nextGoals, rewardXP } = claimWeeklyGoalReward(state.weeklyGoals, goalId)
        if (rewardXP <= 0) return 0

        set({
          xp: state.xp + rewardXP,
          weeklyGoals: nextGoals,
          ...deriveProgressionState({
            xp: state.xp + rewardXP,
            dailyMission: state.dailyMission,
            stats: state.stats,
          }),
        })

        return rewardXP
      },
      syncProgression: () =>
        set((state) => ({
          ...deriveProgressionState({
            xp: state.xp,
            dailyMission: state.dailyMission,
            stats: state.stats,
          }),
          weeklyGoals: syncWeeklyGoalsWithStats(state.weeklyGoals, state.stats),
        })),
      resetMetaProgress: () => set(INITIAL_META_STATE),
    }),
    {
      name: 'nasa-game-storage',
      partialize: (state) => ({
        xp: state.xp,
        equipment: state.equipment,
        dailyMission: state.dailyMission,
        stats: state.stats,
        unlockedRegionIds: state.unlockedRegionIds,
        unlockedBadgeIds: state.unlockedBadgeIds,
        weeklyGoals: state.weeklyGoals,
        recentArcadeRuns: state.recentArcadeRuns,
      }),
    }
  )
)
