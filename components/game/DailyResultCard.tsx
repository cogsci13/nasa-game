'use client'

import { useMetaStore } from '@/store/metaStore'
import { useRunStore } from '@/store/runStore'
import { getLevel } from '@/types/meta'

interface DailyResultCardProps {
  onNext: () => void
}

export default function DailyResultCard({ onNext }: DailyResultCardProps) {
  const currentMission = useRunStore((s) => s.currentMission)
  const xp = useMetaStore((s) => s.xp)
  const lastXPGain = useRunStore((s) => s.lastXPGain)
  const streak = useMetaStore((s) => s.dailyMission.streak)

  if (!currentMission || currentMission.selectedIndex === null) return null

  const { question, selectedIndex } = currentMission
  const correct = selectedIndex === question.correctIndex
  const level = getLevel(xp)

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-8">
      <div className="animate-bounce-once text-7xl">{correct ? '✅' : '❌'}</div>

      <div className="text-center">
        <h2 className={`text-2xl font-bold ${correct ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
          {correct ? '정답!' : '오답!'}
        </h2>
        {!correct && (
          <p className="mt-1 text-sm text-[#E8E8FF]/70">
            정답:{' '}
            <span className="font-semibold text-[#4CAF50]">
              {question.choices[question.correctIndex]}
            </span>
          </p>
        )}
      </div>

      {lastXPGain !== null && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-6 py-3 ${
            lastXPGain > 0
              ? 'border-[#4CAF50]/40 bg-[#4CAF50]/10 text-[#4CAF50]'
              : lastXPGain < 0
              ? 'border-[#F44336]/40 bg-[#F44336]/10 text-[#F44336]'
              : 'border-[#1a237e]/40 bg-[#1a237e]/20 text-[#E8E8FF]/60'
          }`}
        >
          <span className="text-2xl font-bold">
            {lastXPGain > 0 ? `+${lastXPGain}` : lastXPGain === 0 ? '±0' : lastXPGain} XP
          </span>
        </div>
      )}

      <div className="flex gap-6 text-center">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[#FF6B35]">Lv.{level}</span>
          <span className="text-xs text-[#E8E8FF]/50">레벨</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[#E8E8FF]">{xp.toLocaleString()}</span>
          <span className="text-xs text-[#E8E8FF]/50">총 XP</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[#E8E8FF]">🔥{streak}</span>
          <span className="text-xs text-[#E8E8FF]/50">연속 일수</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-2 w-full rounded-2xl bg-[#FF6B35] py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-[#FF6B35]/80 active:scale-[0.98]"
      >
        다음 미션 🚀
      </button>
    </div>
  )
}
