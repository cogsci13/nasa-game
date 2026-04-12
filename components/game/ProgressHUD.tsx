'use client'

import { useMetaStore } from '@/store/metaStore'
import { getCurrentRegion, getLevel, LEVEL_THRESHOLDS, xpForNextLevel } from '@/types/meta'

export default function ProgressHUD() {
  const xp = useMetaStore((s) => s.xp)
  const streak = useMetaStore((s) => s.dailyMission.streak)

  const level = getLevel(xp)
  const region = getCurrentRegion(level)
  const { current, needed, progress } = xpForNextLevel(xp)
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length

  return (
    <header className="w-full border-b border-[#1a237e]/40 bg-[#0a0a1a] px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#FF6B35]">Lv.{level}</span>
            <span className="truncate text-sm font-medium text-[#E8E8FF]">{region.name}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#1a237e]/40">
              <div
                className="h-full rounded-full bg-[#FF6B35] transition-all duration-700 ease-out"
                style={{ width: `${isMaxLevel ? 100 : Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-[#E8E8FF]/60">
              {isMaxLevel ? 'MAX' : `${current}/${needed}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-xl">🔥</span>
          <span className="font-semibold text-[#E8E8FF]">{streak}</span>
          <span className="text-xs text-[#E8E8FF]/60">일 연속</span>
        </div>
      </div>
    </header>
  )
}
