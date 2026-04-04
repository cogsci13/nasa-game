'use client'

import { useGameStore } from '@/store/gameStore'
import { getLevel, getCurrentRegion, xpForNextLevel, LEVEL_THRESHOLDS } from '@/types/game'

export default function HUD() {
  const xp = useGameStore((s) => s.xp)
  const streak = useGameStore((s) => s.dailyMission.streak)

  const level = getLevel(xp)
  const region = getCurrentRegion(level)
  const { current, needed, progress } = xpForNextLevel(xp)
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length

  return (
    <header className="w-full bg-[#0a0a1a] border-b border-[#1a237e]/40 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        {/* Level + Region */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#FF6B35] font-bold text-sm">Lv.{level}</span>
            <span className="text-[#E8E8FF] font-medium text-sm truncate">{region.name}</span>
          </div>
          {/* XP bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-28 h-1.5 bg-[#1a237e]/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B35] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${isMaxLevel ? 100 : Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <span className="text-[#E8E8FF]/60 text-xs whitespace-nowrap">
              {isMaxLevel ? 'MAX' : `${current}/${needed}`}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-xl">🔥</span>
          <span className="text-[#E8E8FF] font-semibold">{streak}</span>
          <span className="text-[#E8E8FF]/60 text-xs">일 연속</span>
        </div>
      </div>
    </header>
  )
}
