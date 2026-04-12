import type { Question, QuestionCategory } from '@/lib/questions/types'

export function pickQuestionFromBank(
  bank: Record<QuestionCategory, Question[]>,
  categories: QuestionCategory[],
  category?: QuestionCategory
): Question {
  const poolCategory =
    category ?? categories[Math.floor(Math.random() * categories.length)]
  const questions = bank[poolCategory]

  if (!questions || questions.length === 0) {
    return bank.unknown[Math.floor(Math.random() * bank.unknown.length)]
  }

  return questions[Math.floor(Math.random() * questions.length)]
}
