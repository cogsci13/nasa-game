import type {
  ProgressStats,
  WeeklyGoalDefinition,
  WeeklyGoalId,
  WeeklyGoalsState,
} from '@/types/meta'

export const WEEKLY_GOAL_DEFINITIONS: WeeklyGoalDefinition[] = [
  {
    id: 'daily-streaker',
    label: '주간 데일리 파일럿',
    description: '이번 주 데일리 미션 2회 완료',
    target: 2,
    rewardXP: 80,
  },
  {
    id: 'arcade-hopper',
    label: '아케이드 점프',
    description: '이번 주 빠른 탐사 3회 완료',
    target: 3,
    rewardXP: 120,
  },
  {
    id: 'sharp-eye',
    label: '정밀 관측',
    description: '이번 주 정답 5회 기록',
    target: 5,
    rewardXP: 100,
  },
]

export function getCurrentWeekKey(now = new Date()): string {
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = base.getUTCDay() || 7
  base.setUTCDate(base.getUTCDate() - day + 1)
  return base.toISOString().slice(0, 10)
}

function getMetricValue(goalId: WeeklyGoalId, stats: ProgressStats): number {
  switch (goalId) {
    case 'daily-streaker':
      return stats.dailyCompletions
    case 'arcade-hopper':
      return stats.arcadeRuns
    case 'sharp-eye':
      return stats.correctAnswers
  }
}

export function createWeeklyGoalsState(weekKey = getCurrentWeekKey()): WeeklyGoalsState {
  return {
    weekKey,
    goals: WEEKLY_GOAL_DEFINITIONS.map((goal) => ({
      ...goal,
      progress: 0,
      completed: false,
      claimed: false,
    })),
  }
}

export function syncWeeklyGoalsWithStats(
  weeklyGoals: WeeklyGoalsState,
  stats: ProgressStats,
  weekKey = getCurrentWeekKey()
): WeeklyGoalsState {
  const current = weeklyGoals.weekKey === weekKey ? weeklyGoals : createWeeklyGoalsState(weekKey)

  return {
    ...current,
    weekKey,
    goals: current.goals.map((goal) => {
      const progress = Math.min(goal.target, getMetricValue(goal.id, stats))
      return {
        ...goal,
        progress,
        completed: progress >= goal.target,
      }
    }),
  }
}

export function claimWeeklyGoalReward(
  weeklyGoals: WeeklyGoalsState,
  goalId: WeeklyGoalId
): { nextGoals: WeeklyGoalsState; rewardXP: number } {
  let rewardXP = 0

  const nextGoals = {
    ...weeklyGoals,
    goals: weeklyGoals.goals.map((goal) => {
      if (goal.id !== goalId || !goal.completed || goal.claimed) {
        return goal
      }

      rewardXP = goal.rewardXP
      return {
        ...goal,
        claimed: true,
      }
    }),
  }

  return { nextGoals, rewardXP }
}
