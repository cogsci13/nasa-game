import type { APODResponse } from '@/lib/nasa'
import {
  QUESTION_BANK,
  QUESTION_CATEGORIES,
} from '@/lib/questions'
import type { Question, QuestionCategory } from '@/lib/questions/types'

const APOD_KEYWORD_MAP: Array<{ keywords: string[]; category: QuestionCategory }> = [
  {
    keywords: ['galaxy', 'spiral', 'elliptical', 'andromeda', 'milky way'],
    category: 'galaxy',
  },
  {
    keywords: ['nebula', 'emission', 'planetary nebula', 'supernova remnant', 'molecular cloud'],
    category: 'nebula',
  },
  {
    keywords: ['planet', 'mars', 'jupiter', 'saturn', 'venus', 'uranus', 'neptune', 'earth', 'moon', 'lunar', 'planetary'],
    category: 'planet',
  },
  {
    keywords: ['spacecraft', 'rocket', 'satellite', 'iss', 'telescope', 'hubble', 'james webb', 'jwst', 'probe', 'lander', 'rover'],
    category: 'spacecraft',
  },
  {
    keywords: ['cluster', 'globular', 'open cluster', 'star cluster'],
    category: 'star_cluster',
  },
  {
    keywords: ['sun', 'solar', 'corona', 'flare', 'sunspot', 'prominence', 'coronal'],
    category: 'solar_system',
  },
  {
    keywords: ['black hole', 'event horizon', 'accretion disk', 'quasar'],
    category: 'black_hole',
  },
]

export function detectApodQuestionCategory(apodData: APODResponse): QuestionCategory {
  const title = (apodData.title ?? '').toLowerCase()
  const explanation = (apodData.explanation ?? '').toLowerCase()
  const combined = `${title} ${explanation}`

  for (const { keywords, category } of APOD_KEYWORD_MAP) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return category
      }
    }
  }

  return 'unknown'
}

export function getDailyQuestionFromApod(apodData: APODResponse): Question {
  const category = detectApodQuestionCategory(apodData)
  return getRandomArcadeQuestion(category)
}

export function getRandomArcadeQuestion(category?: QuestionCategory): Question {
  const poolCategory =
    category ?? QUESTION_CATEGORIES[Math.floor(Math.random() * QUESTION_CATEGORIES.length)]
  const questions = QUESTION_BANK[poolCategory]

  if (!questions || questions.length === 0) {
    return QUESTION_BANK.unknown[Math.floor(Math.random() * QUESTION_BANK.unknown.length)]
  }

  return questions[Math.floor(Math.random() * questions.length)]
}
