export type QuestionCategory =
  | 'galaxy'
  | 'nebula'
  | 'planet'
  | 'spacecraft'
  | 'star_cluster'
  | 'solar_system'
  | 'black_hole'
  | 'unknown'

export interface Question {
  id: string
  text: string
  choices: string[]
  correctIndex: number
  category: QuestionCategory
  hint: string
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  'galaxy',
  'nebula',
  'planet',
  'spacecraft',
  'star_cluster',
  'solar_system',
  'black_hole',
  'unknown',
]
