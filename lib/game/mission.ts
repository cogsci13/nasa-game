import type { APODResponse } from '@/lib/nasa'
import type { Question } from '@/lib/questions'
import type { CurrentMission } from '@/types/run'

export function createMission(apodData: APODResponse, question: Question): CurrentMission {
  return {
    apodData,
    question,
    selectedIndex: null,
    isRisk: false,
    eliminatedChoices: [],
  }
}

export function toggleMissionRisk(currentMission: CurrentMission): CurrentMission {
  return {
    ...currentMission,
    isRisk: !currentMission.isRisk,
  }
}

export function eliminateWrongChoice(
  currentMission: CurrentMission
): { nextMission: CurrentMission; eliminatedIndex: number | null } {
  const eligible = currentMission.question.choices
    .map((_, index) => index)
    .filter(
      (index) =>
        index !== currentMission.question.correctIndex &&
        !currentMission.eliminatedChoices.includes(index)
    )

  if (eligible.length === 0) {
    return { nextMission: currentMission, eliminatedIndex: null }
  }

  const eliminatedIndex = eligible[Math.floor(Math.random() * eligible.length)]

  return {
    eliminatedIndex,
    nextMission: {
      ...currentMission,
      eliminatedChoices: [...currentMission.eliminatedChoices, eliminatedIndex],
    },
  }
}
