import { getLevel, type DailyMission } from '@/types/meta'
import { XP_REWARDS, type CurrentMission } from '@/types/run'

export interface SubmissionResult {
  correct: boolean
  xpDelta: number
  nextXP: number
  leveledUp: boolean
  nextDailyMission: DailyMission
}

export function calculateSubmissionResult({
  currentMission,
  selectedIndex,
  xp,
  dailyMission,
  today,
}: {
  currentMission: CurrentMission
  selectedIndex: number
  xp: number
  dailyMission: DailyMission
  today: string
}): SubmissionResult {
  const correct = selectedIndex === currentMission.question.correctIndex
  const isRisk = currentMission.isRisk

  let xpDelta = 0
  if (correct) {
    xpDelta = isRisk ? XP_REWARDS.riskCorrect : XP_REWARDS.correct
  } else if (isRisk) {
    xpDelta = XP_REWARDS.riskWrong
  }

  const nextXP = Math.max(0, xp + xpDelta)
  const leveledUp = getLevel(nextXP) > getLevel(xp)
  const isNewDay = dailyMission.date !== today
  const streak = correct ? (isNewDay ? dailyMission.streak + 1 : dailyMission.streak) : 0

  return {
    correct,
    xpDelta,
    nextXP,
    leveledUp,
    nextDailyMission: {
      date: today,
      completed: true,
      streak,
    },
  }
}
