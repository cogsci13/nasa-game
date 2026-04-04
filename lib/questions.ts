import type { APODResponse } from './nasa'

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
  text: string // Question text in Korean
  choices: string[] // 3-4 choices in Korean
  correctIndex: number // 0-based index into choices
  category: QuestionCategory
  hint: string // Hint text shown when analyzer equipment used (Korean)
}

export const QUESTION_BANK: Record<QuestionCategory, Question[]> = {
  galaxy: [
    {
      id: 'galaxy-001',
      text: '이 천체는 어떤 종류인가요?',
      choices: ['나선 은하', '타원 은하', '불규칙 은하', '구상 성단'],
      correctIndex: 0,
      category: 'galaxy',
      hint: '나선 팔이 있는지 확인해 보세요',
    },
    {
      id: 'galaxy-002',
      text: '은하의 중심부는 어떤 모양인가요?',
      choices: ['구형의 팽대부', '평평한 원반', '고리 모양', '불규칙한 모양'],
      correctIndex: 0,
      category: 'galaxy',
      hint: '은하 중심에서 빛이 가장 밝게 모여있는 부분을 살펴보세요',
    },
    {
      id: 'galaxy-003',
      text: '이 은하에서 별들은 어떻게 분포되어 있나요?',
      choices: [
        '원반과 팔 구조를 따라 분포',
        '완전히 무작위로 분포',
        '오직 중심부에만 밀집',
        '고리 형태로만 분포',
      ],
      correctIndex: 0,
      category: 'galaxy',
      hint: '은하 구조의 패턴을 찾아보세요',
    },
    {
      id: 'galaxy-004',
      text: '두 은하가 가까이 있을 때 어떤 현상이 일어날 수 있나요?',
      choices: ['중력 상호작용으로 변형', '즉시 충돌하여 폭발', '서로 밀쳐냄', '크기가 줄어듦'],
      correctIndex: 0,
      category: 'galaxy',
      hint: '두 천체가 가까울 때 중력이 어떻게 작용하는지 생각해 보세요',
    },
    {
      id: 'galaxy-005',
      text: '나선 은하의 팔은 주로 무엇으로 이루어져 있나요?',
      choices: [
        '젊고 밝은 별과 성간 물질',
        '오래된 적색 별만',
        '순수한 암흑 물질',
        '행성과 소행성',
      ],
      correctIndex: 0,
      category: 'galaxy',
      hint: '나선 팔의 밝고 푸른 색상은 무엇을 의미하는지 생각해 보세요',
    },
    {
      id: 'galaxy-006',
      text: '타원 은하의 특징으로 올바른 것은?',
      choices: [
        '뚜렷한 나선 팔이 없음',
        '많은 양의 성간 가스와 먼지',
        '활발한 별 형성 활동',
        '규칙적인 고리 구조',
      ],
      correctIndex: 0,
      category: 'galaxy',
      hint: '타원 은하는 나선 은하와 어떻게 다른지 생각해 보세요',
    },
  ],

  nebula: [
    {
      id: 'nebula-001',
      text: '성운(네뷸라)은 주로 무엇으로 이루어져 있나요?',
      choices: ['가스와 먼지', '단단한 암석', '순수한 에너지', '블랙홀 집합체'],
      correctIndex: 0,
      category: 'nebula',
      hint: '성운의 빛나는 색상은 무엇이 이온화되어 나타나는지 생각해 보세요',
    },
    {
      id: 'nebula-002',
      text: '방출 성운에서 빛은 어떻게 생성되나요?',
      choices: [
        '근처 별의 에너지로 가스가 이온화되어 발광',
        '성운 자체에서 핵융합 반응',
        '별빛을 단순히 반사',
        '암흑 물질의 붕괴',
      ],
      correctIndex: 0,
      category: 'nebula',
      hint: '성운 안에 뜨거운 별이 있다면 가스에 어떤 일이 일어날까요?',
    },
    {
      id: 'nebula-003',
      text: '행성상 성운은 어떻게 만들어지나요?',
      choices: [
        '별이 죽어가면서 외층을 방출할 때',
        '두 행성이 충돌할 때',
        '블랙홀이 물질을 방출할 때',
        '성간 가스가 갑자기 모일 때',
      ],
      correctIndex: 0,
      category: 'nebula',
      hint: '태양 같은 별이 수명이 다하면 어떤 일이 일어나는지 생각해 보세요',
    },
    {
      id: 'nebula-004',
      text: '성운이 새로운 별을 만드는 곳을 무엇이라 하나요?',
      choices: ['별 형성 영역(항성 요람)', '초신성 잔해', '행성상 성운', '퀘이사'],
      correctIndex: 0,
      category: 'nebula',
      hint: '성운의 밀도가 높은 곳에서 중력이 물질을 모으면 무엇이 생길 수 있을까요?',
    },
    {
      id: 'nebula-005',
      text: '초신성 잔해 성운은 무엇에서 만들어지나요?',
      choices: [
        '거대한 별의 폭발적 최후',
        '두 성운의 충돌',
        '별 사이의 충돌',
        '블랙홀 증발',
      ],
      correctIndex: 0,
      category: 'nebula',
      hint: '매우 무거운 별이 수명이 다하면 어떤 폭발적 사건이 일어나나요?',
    },
  ],

  planet: [
    {
      id: 'planet-001',
      text: '태양계에서 가장 큰 행성은 무엇인가요?',
      choices: ['목성', '토성', '천왕성', '해왕성'],
      correctIndex: 0,
      category: 'planet',
      hint: '대적점(Great Red Spot)으로 유명한 행성을 생각해 보세요',
    },
    {
      id: 'planet-002',
      text: '화성의 표면이 붉게 보이는 이유는?',
      choices: ['철 산화물(녹)', '유황 퇴적물', '파란 하늘의 반사', '뜨거운 용암'],
      correctIndex: 0,
      category: 'planet',
      hint: '화성의 토양 성분에 지구에서도 흔한 산화 반응의 산물이 있습니다',
    },
    {
      id: 'planet-003',
      text: '토성의 가장 유명한 특징은 무엇인가요?',
      choices: ['아름다운 고리 시스템', '대적점 폭풍', '두꺼운 이산화탄소 대기', '지표 액체 바다'],
      correctIndex: 0,
      category: 'planet',
      hint: '망원경으로 토성을 보면 가장 눈에 띄는 구조물이 있습니다',
    },
    {
      id: 'planet-004',
      text: '달(월)은 지구를 기준으로 어떤 천체인가요?',
      choices: ['자연 위성', '왜소 행성', '소행성', '혜성'],
      correctIndex: 0,
      category: 'planet',
      hint: '달은 지구 주위를 공전하는 천체입니다',
    },
    {
      id: 'planet-005',
      text: '금성의 표면 온도가 매우 높은 이유는?',
      choices: [
        '두꺼운 이산화탄소 대기로 인한 온실 효과',
        '태양에 가장 가깝기 때문',
        '내부 방사성 붕괴 열',
        '지속적인 화산 폭발',
      ],
      correctIndex: 0,
      category: 'planet',
      hint: '금성의 대기 성분과 온실 효과의 관계를 생각해 보세요',
    },
    {
      id: 'planet-006',
      text: '목성의 대적점(Great Red Spot)은 무엇인가요?',
      choices: ['수백 년째 지속되는 거대 폭풍', '화산 분화구', '거대한 운석 충돌 흔적', '대기 구멍'],
      correctIndex: 0,
      category: 'planet',
      hint: '지구보다 큰 붉은 타원형 구조물의 정체는 무엇일까요?',
    },
  ],

  spacecraft: [
    {
      id: 'spacecraft-001',
      text: '허블 우주 망원경의 주요 장점은 무엇인가요?',
      choices: [
        '대기권 밖에서 대기 왜곡 없이 관측',
        '지상 망원경보다 훨씬 큼',
        '적외선만 볼 수 있음',
        '달 궤도에서 관측',
      ],
      correctIndex: 0,
      category: 'spacecraft',
      hint: '우주 망원경과 지상 망원경의 가장 큰 차이는 위치에 있습니다',
    },
    {
      id: 'spacecraft-002',
      text: 'ISS(국제우주정거장)는 어떤 고도에서 지구를 공전하나요?',
      choices: ['약 400km 저궤도', '약 36,000km 정지궤도', '달 궤도', '화성 궤도'],
      correctIndex: 0,
      category: 'spacecraft',
      hint: 'ISS는 저궤도에서 약 90분에 지구를 한 바퀴 돕니다',
    },
    {
      id: 'spacecraft-003',
      text: '제임스 웹 우주 망원경(JWST)의 특징은?',
      choices: [
        '적외선으로 우주 초기를 관측',
        '자외선으로만 관측 가능',
        '지구 저궤도에 위치',
        '사람이 탑승하여 운용',
      ],
      correctIndex: 0,
      category: 'spacecraft',
      hint: '제임스 웹은 허블보다 더 먼 우주를 보기 위해 어떤 파장을 활용하나요?',
    },
    {
      id: 'spacecraft-004',
      text: '로켓이 지구를 벗어나기 위해 필요한 것은?',
      choices: ['탈출 속도(초속 약 11.2km) 이상', '매우 큰 질량', '핵에너지 추진', '태양풍 이용'],
      correctIndex: 0,
      category: 'spacecraft',
      hint: '지구 중력을 이기고 우주로 나가기 위한 최소 속도가 있습니다',
    },
    {
      id: 'spacecraft-005',
      text: '보이저 1호(Voyager 1)의 현재 위치는?',
      choices: [
        '태양계 밖 성간 공간',
        '화성 궤도 근처',
        '목성 주변',
        '오르트 구름 안쪽',
      ],
      correctIndex: 0,
      category: 'spacecraft',
      hint: '1977년에 발사된 보이저 1호는 인류가 만든 가장 먼 곳까지 간 물체입니다',
    },
  ],

  star_cluster: [
    {
      id: 'star_cluster-001',
      text: '구상 성단(globular cluster)의 특징은?',
      choices: [
        '수십만 개의 별이 구형으로 밀집',
        '별이 불규칙하게 흩어짐',
        '젊고 뜨거운 별만 포함',
        '단 몇백 개의 별로 구성',
      ],
      correctIndex: 0,
      category: 'star_cluster',
      hint: '구상 성단의 이름에서 모양의 힌트를 찾을 수 있습니다',
    },
    {
      id: 'star_cluster-002',
      text: '산개 성단(open cluster)과 구상 성단의 차이점은?',
      choices: [
        '산개 성단은 별이 느슨하게 분포하고 더 젊음',
        '산개 성단이 더 많은 별을 포함',
        '구상 성단이 더 젊은 별들로 구성',
        '산개 성단은 은하 핵심에 위치',
      ],
      correctIndex: 0,
      category: 'star_cluster',
      hint: '두 성단의 이름과 모양을 비교해 보세요',
    },
    {
      id: 'star_cluster-003',
      text: '성단 내의 별들이 함께 태어났다는 증거는?',
      choices: [
        '모두 비슷한 나이와 화학적 성분',
        '모두 같은 색깔',
        '같은 방향으로 자전',
        '동일한 크기',
      ],
      correctIndex: 0,
      category: 'star_cluster',
      hint: '같은 성운에서 동시에 태어난 별들은 무엇을 공유할까요?',
    },
    {
      id: 'star_cluster-004',
      text: '플레이아데스(Pleiades)는 어떤 종류의 성단인가요?',
      choices: ['산개 성단', '구상 성단', '은하 중심 성단', '구형 성운'],
      correctIndex: 0,
      category: 'star_cluster',
      hint: '맨눈으로도 보이는 플레이아데스는 별들이 느슨하게 모여 있습니다',
    },
    {
      id: 'star_cluster-005',
      text: '구상 성단은 주로 은하의 어느 부분에 위치하나요?',
      choices: ['은하 헤일로(후광)', '은하 원반', '은하 중심핵', '나선 팔'],
      correctIndex: 0,
      category: 'star_cluster',
      hint: '구상 성단은 은하 중심을 중심으로 구형으로 분포합니다',
    },
  ],

  solar_system: [
    {
      id: 'solar_system-001',
      text: '태양의 표면에서 관찰할 수 있는 어두운 점은?',
      choices: ['흑점(태양흑점)', '태양 폭발', '운석 충돌 흔적', '코로나 구멍'],
      correctIndex: 0,
      category: 'solar_system',
      hint: '태양 표면의 자기장이 강한 곳은 온도가 낮아 보이게 됩니다',
    },
    {
      id: 'solar_system-002',
      text: '태양 코로나(corona)는 무엇인가요?',
      choices: [
        '태양의 외부 대기층',
        '태양 표면의 핵융합 층',
        '태양 중심핵',
        '태양풍이 시작되는 내부층',
      ],
      correctIndex: 0,
      category: 'solar_system',
      hint: '일식 때 달이 태양을 가리면 보이는 밝은 후광을 생각해 보세요',
    },
    {
      id: 'solar_system-003',
      text: '태양 플레어(solar flare)란 무엇인가요?',
      choices: [
        '태양 표면에서 발생하는 강력한 에너지 폭발',
        '태양 주위를 도는 혜성',
        '태양 흑점이 사라지는 현상',
        '달이 태양 앞을 지나는 현상',
      ],
      correctIndex: 0,
      category: 'solar_system',
      hint: '태양 플레어는 지구의 통신에도 영향을 줄 수 있는 사건입니다',
    },
    {
      id: 'solar_system-004',
      text: '태양풍(solar wind)은 무엇으로 이루어져 있나요?',
      choices: [
        '태양에서 방출된 하전 입자(주로 전자와 양성자)',
        '태양의 빛과 열만',
        '태양 대기의 가스',
        '태양에서 나온 음파',
      ],
      correctIndex: 0,
      category: 'solar_system',
      hint: '오로라는 태양풍이 지구 자기장과 만날 때 생기는 현상입니다',
    },
    {
      id: 'solar_system-005',
      text: '태양에서 에너지는 어떻게 만들어지나요?',
      choices: [
        '수소 핵융합으로 헬륨 생성',
        '탄소 연소 반응',
        '방사성 원소 붕괴',
        '중력 수축만으로',
      ],
      correctIndex: 0,
      category: 'solar_system',
      hint: '태양의 핵에서 가장 가벼운 원소가 융합하여 다음 원소가 됩니다',
    },
  ],

  black_hole: [
    {
      id: 'black_hole-001',
      text: '블랙홀이란 무엇인가요?',
      choices: [
        '중력이 너무 강해 빛도 탈출할 수 없는 천체',
        '매우 어두운 별',
        '빛을 흡수하는 성운',
        '별과 별 사이의 빈 공간',
      ],
      correctIndex: 0,
      category: 'black_hole',
      hint: '블랙홀의 가장 중요한 특성은 탈출 속도와 관련이 있습니다',
    },
    {
      id: 'black_hole-002',
      text: '사건의 지평선(event horizon)이란?',
      choices: [
        '블랙홀에서 빛도 탈출할 수 없는 경계면',
        '블랙홀의 중심점',
        '블랙홀 주변의 강착 원반',
        '블랙홀과 일반 공간의 온도 경계',
      ],
      correctIndex: 0,
      category: 'black_hole',
      hint: '이 경계를 넘어서면 어떤 것도 돌아올 수 없습니다',
    },
    {
      id: 'black_hole-003',
      text: '블랙홀 주변의 강착 원반(accretion disk)은 무엇인가요?',
      choices: [
        '블랙홀로 빨려들어가는 가스와 먼지의 소용돌이',
        '블랙홀을 둘러싼 얼음 고리',
        '블랙홀이 방출하는 빛의 원',
        '블랙홀 주변의 행성들',
      ],
      correctIndex: 0,
      category: 'black_hole',
      hint: '빨려들어가는 물질은 원반 모양으로 정렬되고 강하게 가열됩니다',
    },
    {
      id: 'black_hole-004',
      text: '초대질량 블랙홀은 어디에 위치하는 경향이 있나요?',
      choices: ['대부분의 은하 중심', '성단 내부', '나선 팔 끝', '성운 중심'],
      correctIndex: 0,
      category: 'black_hole',
      hint: '우리 은하 중심의 궁수자리 A*를 떠올려 보세요',
    },
    {
      id: 'black_hole-005',
      text: '블랙홀을 직접 촬영하기 어려운 이유는?',
      choices: [
        '빛을 방출하지 않아 빛의 굴절로만 관측 가능',
        '너무 작아서',
        '너무 뜨거워서',
        '항상 움직이기 때문에',
      ],
      correctIndex: 0,
      category: 'black_hole',
      hint: '블랙홀 자체가 빛을 내지 않는다면 어떻게 관측할 수 있을까요?',
    },
  ],

  unknown: [
    {
      id: 'unknown-001',
      text: '이 천체 사진에서 가장 눈에 띄는 특징은 무엇인가요?',
      choices: ['밝고 집중된 빛', '구름 같은 가스 구조', '고리 모양', '나선 패턴'],
      correctIndex: 0,
      category: 'unknown',
      hint: '사진에서 가장 밝은 부분을 살펴보세요',
    },
    {
      id: 'unknown-002',
      text: 'NASA의 APOD(오늘의 천문학 사진) 프로그램은 언제 시작되었나요?',
      choices: ['1995년', '1969년', '2000년', '1985년'],
      correctIndex: 0,
      category: 'unknown',
      hint: 'APOD는 인터넷 초기 시대에 시작된 오랜 전통의 프로그램입니다',
    },
    {
      id: 'unknown-003',
      text: '우주에서 가장 흔한 원소는 무엇인가요?',
      choices: ['수소', '헬륨', '산소', '탄소'],
      correctIndex: 0,
      category: 'unknown',
      hint: '태양의 약 75%를 차지하는 원소입니다',
    },
    {
      id: 'unknown-004',
      text: '빛이 1년 동안 이동하는 거리를 무엇이라 하나요?',
      choices: ['광년(light-year)', '천문단위(AU)', '파섹(parsec)', '킬로파섹'],
      correctIndex: 0,
      category: 'unknown',
      hint: '광속은 약 초속 30만 km입니다. 1년은 약 3,150만 초입니다',
    },
    {
      id: 'unknown-005',
      text: '우주의 나이는 약 얼마인가요?',
      choices: ['약 138억 년', '약 46억 년', '약 1,000억 년', '약 50억 년'],
      correctIndex: 0,
      category: 'unknown',
      hint: '빅뱅 이후 현재까지의 시간을 생각해 보세요',
    },
  ],
}

// Keyword-to-category mapping
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

function detectCategory(apodData: APODResponse): QuestionCategory {
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

export function getQuestion(apodData: APODResponse): Question {
  const category = detectCategory(apodData)
  const questions = QUESTION_BANK[category]

  if (!questions || questions.length === 0) {
    const fallback = QUESTION_BANK['unknown']
    return fallback[Math.floor(Math.random() * fallback.length)]
  }

  return questions[Math.floor(Math.random() * questions.length)]
}

export function clearQuestionCache(): void {
  // No cache to clear currently; exported for test isolation compatibility
}
