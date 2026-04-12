import { create } from 'zustand'
import type { APODResponse } from '@/lib/nasa'
import type { Question } from '@/lib/questions'
import {
  ARCADE_ROUND_TIME,
  type ArcadePowerupId,
  type ArcadeSession,
  type CurrentMission,
} from '@/types/run'
import {
  calculateArcadeReward,
  calculateArcadeRoundScore,
  createArcadeSession,
  getArcadeRoundDuration,
} from '@/lib/game/arcade'
import { getTrackerEventState } from '@/lib/game/trackerEvents'
import { createMission, eliminateWrongChoice, toggleMissionRisk } from '@/lib/game/mission'
import { calculateSubmissionResult } from '@/lib/game/scoring'
import { useMetaStore } from '@/store/metaStore'

export interface RunState {
  currentMission: CurrentMission | null
  lastXPGain: number | null
  arcadeSession: ArcadeSession | null
}

export interface RunActions {
  startDailyMission: (apodData: APODResponse, question: Question) => void
  toggleRisk: () => void
  useAnalyzer: () => void
  submitAnswer: (selectedIndex: number) => {
    correct: boolean
    xpDelta: number
    leveledUp?: boolean
  }
  resetForNewDay: () => void
  startArcadeRun: () => void
  answerArcadeRound: (selectedIndex: number) => void
  timeoutArcadeRound: () => void
  tickArcadeTimer: () => void
  useArcadePowerup: (powerupId: ArcadePowerupId) => void
  advanceArcadeRound: () => void
  finishArcadeRun: () => void
  claimArcadeReward: () => number
  setCurrentMission: (currentMission: CurrentMission | null) => void
  setLastXPGain: (lastXPGain: number | null) => void
  resetRunState: () => void
}

export type RunStore = RunState & RunActions

export const INITIAL_RUN_STATE: RunState = {
  currentMission: null,
  lastXPGain: null,
  arcadeSession: null,
}

export const useRunStore = create<RunStore>()((set, get) => ({
  ...INITIAL_RUN_STATE,

  startDailyMission(apodData, question) {
    set({
      currentMission: createMission(apodData, question),
      lastXPGain: null,
    })
  },

  toggleRisk() {
    const { currentMission } = get()
    if (!currentMission || currentMission.selectedIndex !== null) return

    set({
      currentMission: toggleMissionRisk(currentMission),
    })
  },

  useAnalyzer() {
    const { currentMission } = get()
    const { equipment } = useMetaStore.getState()
    if (!currentMission) return
    if (equipment.analyzer.uses <= 0) return
    if (currentMission.selectedIndex !== null) return

    const { nextMission, eliminatedIndex } = eliminateWrongChoice(currentMission)
    if (eliminatedIndex === null) return

    set({
      currentMission: nextMission,
    })

    useMetaStore.getState().setEquipment({
      ...equipment,
      analyzer: { uses: equipment.analyzer.uses - 1 },
    })
  },

  submitAnswer(selectedIndex) {
    const { currentMission } = get()
    const {
      xp,
      dailyMission,
      setXP,
      setDailyMission,
      recordDailyMissionCompletion,
    } = useMetaStore.getState()

    if (!currentMission) return { correct: false, xpDelta: 0 }
    if (currentMission.selectedIndex !== null) return { correct: false, xpDelta: 0 }

    const today = new Date().toISOString().split('T')[0]
    const result = calculateSubmissionResult({
      currentMission,
      selectedIndex,
      xp,
      dailyMission,
      today,
    })

    setXP(result.nextXP)
    set({
      lastXPGain: result.xpDelta,
      currentMission: {
        ...currentMission,
        selectedIndex,
      },
    })
    setDailyMission(result.nextDailyMission)
    recordDailyMissionCompletion({ correct: result.correct })

    return {
      correct: result.correct,
      xpDelta: result.xpDelta,
      leveledUp: result.leveledUp,
    }
  },

  resetForNewDay() {
    set({ currentMission: null, lastXPGain: null })
  },

  startArcadeRun() {
    const metaState = useMetaStore.getState()
    const trackerState = getTrackerEventState({
      xp: metaState.xp,
      streak: metaState.dailyMission.streak,
      stats: metaState.stats,
      unlockedRegionIds: metaState.unlockedRegionIds,
      unlockedBadgeIds: metaState.unlockedBadgeIds,
    })
    set({
      arcadeSession: createArcadeSession(trackerState.bonuses),
    })
  },

  answerArcadeRound(selectedIndex) {
    const { arcadeSession } = get()
    if (!arcadeSession || arcadeSession.status !== 'active') return
    if (arcadeSession.selectedIndex !== null) return

    const currentRound = arcadeSession.rounds[arcadeSession.roundIndex]
    if (!currentRound) return
    useMetaStore.getState().recordArcadeAnswer({
      correct: selectedIndex === currentRound.question.correctIndex,
    })

    if (selectedIndex === currentRound.question.correctIndex) {
      const comboDelta = currentRound.event.id === 'combo-burst' ? 2 : 1
      const nextCombo = arcadeSession.combo + comboDelta
      const roundScore = calculateArcadeRoundScore(
        nextCombo,
        arcadeSession.timeLeft,
        currentRound.event
      )
      const specialScoreBonus =
        currentRound.special?.kind === 'apod-briefing'
          ? 45
          : currentRound.special?.kind === 'tracker-lock'
          ? arcadeSession.trackerBonuses.trackerLockBonusScore
          : 0
      const nextShieldCharges =
        currentRound.special?.kind === 'tracker-lock'
          ? Math.min(arcadeSession.powerups.shield + 1, 2)
          : arcadeSession.powerups.shield

      set({
        arcadeSession: {
          ...arcadeSession,
          selectedIndex,
          eliminatedChoices: [],
          combo: nextCombo,
          bestCombo: Math.max(arcadeSession.bestCombo, nextCombo),
          score: arcadeSession.score + roundScore + specialScoreBonus,
          specialSuccesses:
            arcadeSession.specialSuccesses + (currentRound.special ? 1 : 0),
          shieldArmed: false,
          powerups: {
            ...arcadeSession.powerups,
            shield: nextShieldCharges,
          },
        },
      })
      return
    }

    const damage = arcadeSession.shieldArmed
      ? 0
      : currentRound.event.id === 'fragile-hull'
      ? 2
      : 1
    const nextLives = Math.max(0, arcadeSession.lives - damage)
    set({
      arcadeSession: {
        ...arcadeSession,
        selectedIndex,
        eliminatedChoices: [],
        combo: 0,
        lives: nextLives,
        status: nextLives === 0 ? 'completed' : arcadeSession.status,
        shieldArmed: false,
      },
    })
  },

  timeoutArcadeRound() {
    const { arcadeSession } = get()
    if (!arcadeSession || arcadeSession.status !== 'active') return
    if (arcadeSession.selectedIndex !== null) return

    const currentRound = arcadeSession.rounds[arcadeSession.roundIndex]
    const damage = arcadeSession.shieldArmed
      ? 0
      : currentRound?.event.id === 'fragile-hull'
      ? 2
      : 1
    const nextLives = Math.max(0, arcadeSession.lives - damage)
    set({
      arcadeSession: {
        ...arcadeSession,
        selectedIndex: -1,
        eliminatedChoices: [],
        combo: 0,
        lives: nextLives,
        timeLeft: 0,
        status: nextLives === 0 ? 'completed' : arcadeSession.status,
        shieldArmed: false,
      },
    })
  },

  tickArcadeTimer() {
    const { arcadeSession, timeoutArcadeRound } = get()
    if (!arcadeSession || arcadeSession.status !== 'active') return
    if (arcadeSession.selectedIndex !== null) return

    if (arcadeSession.timeLeft <= 1) {
      timeoutArcadeRound()
      return
    }

    set({
      arcadeSession: {
        ...arcadeSession,
        timeLeft: arcadeSession.timeLeft - 1,
      },
      })
  },

  useArcadePowerup(powerupId) {
    const { arcadeSession } = get()
    if (!arcadeSession || arcadeSession.status !== 'active') return
    if (arcadeSession.powerups[powerupId] <= 0) return
    if (arcadeSession.selectedIndex !== null) return

    if (powerupId === 'shield') {
      set({
        arcadeSession: {
          ...arcadeSession,
          shieldArmed: true,
          powerups: {
            ...arcadeSession.powerups,
            shield: arcadeSession.powerups.shield - 1,
          },
        },
      })
      return
    }

    if (powerupId === 'time-warp') {
      set({
        arcadeSession: {
          ...arcadeSession,
          timeLeft: arcadeSession.timeLeft + 5,
          powerups: {
            ...arcadeSession.powerups,
            'time-warp': arcadeSession.powerups['time-warp'] - 1,
          },
        },
      })
      return
    }

    if (powerupId === 'scanner') {
      const currentRound = arcadeSession.rounds[arcadeSession.roundIndex]
      if (!currentRound) return
      const eligible = currentRound.question.choices
        .map((_, index) => index)
        .filter(
          (index) =>
            index !== currentRound.question.correctIndex &&
            !arcadeSession.eliminatedChoices.includes(index)
        )
      if (eligible.length === 0) return
      const eliminatedIndex = eligible[Math.floor(Math.random() * eligible.length)]
      set({
        arcadeSession: {
          ...arcadeSession,
          eliminatedChoices: [...arcadeSession.eliminatedChoices, eliminatedIndex],
          powerups: {
            ...arcadeSession.powerups,
            scanner: arcadeSession.powerups.scanner - 1,
          },
        },
      })
    }
  },

  advanceArcadeRound() {
    const { arcadeSession } = get()
    if (!arcadeSession) return

    if (
      arcadeSession.roundIndex >= arcadeSession.rounds.length - 1 ||
      arcadeSession.lives <= 0
    ) {
      set({
        arcadeSession: {
          ...arcadeSession,
          status: 'completed',
        },
      })
      return
    }

    set({
      arcadeSession: {
        ...arcadeSession,
        roundIndex: arcadeSession.roundIndex + 1,
        selectedIndex: null,
        eliminatedChoices: [],
        shieldArmed: false,
        timeLeft: getArcadeRoundDuration(
          arcadeSession.rounds[arcadeSession.roundIndex + 1]?.event ?? arcadeSession.rounds[0].event
        ),
      },
    })
  },

  finishArcadeRun() {
    const { arcadeSession } = get()
    if (!arcadeSession) return

    set({
      arcadeSession: {
        ...arcadeSession,
        status: 'completed',
      },
    })
  },

  claimArcadeReward() {
    const { arcadeSession } = get()
    if (!arcadeSession || arcadeSession.rewardClaimed) return 0

    const reward = calculateArcadeReward(
      arcadeSession.score,
      arcadeSession.lives,
      arcadeSession.powerups
    )
    const metaStore = useMetaStore.getState()
    const perfect =
      arcadeSession.roundIndex >= arcadeSession.rounds.length - 1 && arcadeSession.lives >= 2
    metaStore.setXP(metaStore.xp + reward)
    metaStore.recordArcadeRun({
      score: arcadeSession.score,
      perfect,
      bestCombo: arcadeSession.bestCombo,
      specialSuccesses: arcadeSession.specialSuccesses,
    })
    metaStore.recordArcadeRunRecord({
      id: `run-${Date.now()}`,
      finishedAt: new Date().toISOString(),
      score: arcadeSession.score,
      rewardXP: reward,
      roundsCleared: Math.min(arcadeSession.roundIndex + 1, arcadeSession.rounds.length),
      livesLeft: arcadeSession.lives,
      bestCombo: arcadeSession.bestCombo,
      specialSuccesses: arcadeSession.specialSuccesses,
      perfect,
    })
    metaStore.syncProgression()

    set({
      arcadeSession: {
        ...arcadeSession,
        rewardClaimed: true,
      },
    })

    return reward
  },

  setCurrentMission: (currentMission) => set({ currentMission }),
  setLastXPGain: (lastXPGain) => set({ lastXPGain }),
  resetRunState: () => set(INITIAL_RUN_STATE),
}))
