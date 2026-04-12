'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchAPOD, formatDateForAPI, NASANetworkError, NASARateLimitError } from '@/lib/nasa'
import { getDailyQuestionFromApod } from '@/lib/content/questionProviders'
import { useMetaStore } from '@/store/metaStore'
import { useRunStore } from '@/store/runStore'
import ProgressHUD from '@/components/game/ProgressHUD'
import DailyQuizCard from '@/components/game/DailyQuizCard'
import DailyResultCard from '@/components/game/DailyResultCard'

type GamePhase = 'loading' | 'quiz' | 'result' | 'error' | 'already_done'

export default function DailyMissionScreen() {
  const [phase, setPhase] = useState<GamePhase>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const dailyMission = useMetaStore((state) => state.dailyMission)
  const currentMission = useRunStore((state) => state.currentMission)
  const startDailyMission = useRunStore((state) => state.startDailyMission)
  const resetForNewDay = useRunStore((state) => state.resetForNewDay)

  const today = formatDateForAPI(new Date())

  const loadMission = useCallback(async () => {
    setPhase('loading')
    setErrorMessage('')

    try {
      const apod = await fetchAPOD(today)
      const question = getDailyQuestionFromApod(apod)
      startDailyMission(apod, question)
      setPhase('quiz')
    } catch (error) {
      if (error instanceof NASARateLimitError) {
        setErrorMessage('NASA API 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.')
      } else if (error instanceof NASANetworkError) {
        setErrorMessage('탐사 신호가 불안정합니다. 네트워크를 확인하고 다시 시도해 주세요.')
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.')
      }
      setPhase('error')
    }
  }, [today, startDailyMission])

  useEffect(() => {
    if (dailyMission.date === today && dailyMission.completed) {
      if (currentMission && currentMission.selectedIndex !== null) {
        setPhase('result')
      } else {
        setPhase('already_done')
      }
      return
    }

    if (dailyMission.date !== today) {
      resetForNewDay()
    }

    loadMission()
  }, [])

  useEffect(() => {
    if (currentMission?.selectedIndex !== null && currentMission?.selectedIndex !== undefined && phase === 'quiz') {
      setPhase('result')
    }
  }, [currentMission?.selectedIndex, phase])

  function handleNextMission() {
    setPhase('already_done')
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#FF6B35]/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-[#FF6B35]/60 animate-ping [animation-delay:0.3s]" />
            <div className="absolute inset-4 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <p className="text-[#E8E8FF]/60 text-sm animate-pulse">오늘의 미션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="text-5xl">📡</div>
          <div>
            <h2 className="text-[#F44336] text-xl font-bold mb-2">탐사 신호 불안정</h2>
            <p className="text-[#E8E8FF]/60 text-sm max-w-xs">{errorMessage}</p>
          </div>
          <button
            onClick={loadMission}
            className="px-8 py-3 bg-[#FF6B35] text-white font-bold rounded-xl hover:bg-[#FF6B35]/80 transition-all"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'already_done') {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
        <ProgressHUD />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="text-6xl">🌌</div>
          <div>
            <h2 className="text-[#E8E8FF] text-xl font-bold mb-2">오늘의 미션 완료!</h2>
            <p className="text-[#E8E8FF]/60 text-sm max-w-xs">
              내일 새로운 APOD 이미지와 함께 돌아오세요.
              <br />
              매일 플레이하면 스트릭을 쌓을 수 있어요 🔥
            </p>
          </div>
          <div className="bg-[#1a237e]/20 border border-[#1a237e]/40 rounded-2xl px-6 py-4 text-sm text-[#E8E8FF]/70">
            다음 미션: {getNextMissionTime()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      <ProgressHUD />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {phase === 'quiz' && <DailyQuizCard />}
        {phase === 'result' && <DailyResultCard onNext={handleNextMission} />}
      </main>
    </div>
  )
}

function getNextMissionTime(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  const diffMs = tomorrow.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffM = Math.floor((diffMs % 3600000) / 60000)
  return `${diffH}시간 ${diffM}분 후`
}
