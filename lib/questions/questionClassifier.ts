import type { APODResponse } from '@/lib/nasa'
import type { QuestionCategory } from '@/lib/questions/types'

const KEYWORD_MAP: Array<{ keywords: string[]; category: QuestionCategory }> = [
  {
    keywords: ['black hole', 'event horizon', 'singularity', 'blackhole'],
    category: 'black_hole',
  },
  {
    keywords: ['galaxy', 'spiral', 'elliptical', 'irregular galaxy', 'galactic'],
    category: 'galaxy',
  },
  {
    keywords: ['nebula', 'cloud', 'gas cloud', 'dust cloud', 'emission nebula', 'planetary nebula'],
    category: 'nebula',
  },
  {
    keywords: [
      'planet',
      'mars',
      'jupiter',
      'saturn',
      'venus',
      'uranus',
      'neptune',
      'earth',
      'moon',
      'lunar',
      'planetary',
    ],
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
]

export function detectQuestionCategory(apodData: APODResponse): QuestionCategory {
  const title = (apodData.title ?? '').toLowerCase()
  const explanation = (apodData.explanation ?? '').toLowerCase()
  const combined = `${title} ${explanation}`

  for (const { keywords, category } of KEYWORD_MAP) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return category
      }
    }
  }

  return 'unknown'
}
