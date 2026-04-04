'use client'

import { useGameStore } from '@/store/gameStore'
import { getLevel } from '@/types/game'

interface ResultCardProps {
  onNext: () => void
}

export default function ResultCard({ onNext }: ResultCardProps) {
  const currentMission = useGameStore((s) => s.currentMission)
  const xp = useGameStore((s) => s.xp)
  const lastXPGain = useGameStore((s) => s.lastXPGain)
  const streak = useGameStore((s) => s.dailyMission.streak)

  if (!currentMission || currentMission.selectedIndex === null) return null

  const { question, selectedIndex } = currentMission
  const correct = selectedIndex === question.correctIndex
  const level = getLevel(xp)

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 px-4 py-8">
      {/* Result icon */}
      <div className="text-7xl animate-bounce-once">
        {correct ? '✅' : '❌'}
      </div>

      {/* Result text */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${correct ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
          {correct ? '정답!' : '오답!'}
        </h2>
        {!correct && (
          <p className="text-[#E8E8FF]/70 text-sm mt-1">
            정답: <span className="text-[#4CAF50] font-semibold">{question.choices[question.correctIndex]}</span>
          </p>
        )}
      </div>

      {/* XP gain */}
      {lastXPGain !== null && (
        <div
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border ${
            lastXPGain > 0
              ? 'bg-[#4CAF50]/10 border-[#4CAF50]/40 text-[#4CAF50]'
              : lastXPGain < 0
              ? 'bg-[#F44336]/10 border-[#F44336]/40 text-[#F44336]'
              : 'bg-[#1a237e]/20 border-[#1a237e]/40 text-[#E8E8FF]/60'
          }`}
        >
          <span className="text-2xl font-bold">
            {lastXPGain > 0 ? `+${lastXPGain}` : lastXPGain === 0 ? '±0' : lastXPGain} XP
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 text-center">
        <div className="flex flex-col">
          <span className="text-[#FF6B35] text-xl font-bold">Lv.{level}</span>
          <span className="text-[#E8E8FF]/50 text-xs">레벨</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#E8E8FF] text-xl font-bold">{xp.toLocaleString()}</span>
          <span className="text-[#E8E8FF]/50 text-xs">총 XP</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#E8E8FF] text-xl font-bold">🔥{streak}</span>
          <span className="text-[#E8E8FF]/50 text-xs">연속 일수</span>
        </div>
      </div>

      {/* Next mission button */}
      <button
        onClick={onNext}
        className="mt-2 w-full py-4 rounded-2xl bg-[#FF6B35] text-white font-bold text-lg hover:bg-[#FF6B35]/80 active:scale-[0.98] transition-all duration-200"
      >
        다음 미션 🚀
      </button>
    </div>
  )
}
