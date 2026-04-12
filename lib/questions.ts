import type { APODResponse } from './nasa'
import { detectQuestionCategory } from '@/lib/questions/questionClassifier'
import { QUESTION_BANK } from '@/lib/questions/questionBank'
import { pickQuestionFromBank } from '@/lib/questions/questionPicker'
import {
  QUESTION_CATEGORIES,
  type Question,
  type QuestionCategory,
} from '@/lib/questions/types'

export { QUESTION_BANK, QUESTION_CATEGORIES }
export type { Question, QuestionCategory }

export function getQuestion(apodData: APODResponse): Question {
  const category = detectQuestionCategory(apodData)
  return getRandomQuestion(category)
}

export function getRandomQuestion(category?: QuestionCategory): Question {
  return pickQuestionFromBank(QUESTION_BANK, QUESTION_CATEGORIES, category)
}

export function clearQuestionCache(): void {
  // No cache to clear currently; exported for test isolation compatibility
}
