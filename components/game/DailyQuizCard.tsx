'use client'

import Image from 'next/image'
import { useMetaStore } from '@/store/metaStore'
import { useRunStore } from '@/store/runStore'

export default function DailyQuizCard() {
  const currentMission = useRunStore((s) => s.currentMission)
  const equipment = useMetaStore((s) => s.equipment)
  const toggleRisk = useRunStore((s) => s.toggleRisk)
  const useAnalyzer = useRunStore((s) => s.useAnalyzer)
  const submitAnswer = useRunStore((s) => s.submitAnswer)

  if (!currentMission) return null

  const { apodData, question, selectedIndex, isRisk, eliminatedChoices } = currentMission
  const answered = selectedIndex !== null

  function choiceStyle(index: number): string {
    const base =
      'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 '

    if (eliminatedChoices.includes(index)) {
      return `${base} cursor-not-allowed border-[#1a237e]/20 bg-[#1a237e]/20 text-[#E8E8FF]/40 opacity-30 line-through`
    }

    if (!answered) {
      return `${base} cursor-pointer border-[#1a237e]/60 bg-[#1a237e]/30 text-[#E8E8FF] hover:border-[#FF6B35]/60 hover:bg-[#1a237e]/60 active:scale-[0.98]`
    }

    if (index === question.correctIndex) {
      return `${base} border-[#4CAF50] bg-[#4CAF50]/20 font-bold text-[#4CAF50]`
    }

    if (index === selectedIndex) {
      return `${base} border-[#F44336] bg-[#F44336]/20 text-[#F44336]`
    }

    return `${base} border-[#1a237e]/20 bg-[#1a237e]/20 text-[#E8E8FF]/40 opacity-40`
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#1a237e]/20">
        <Image
          src={apodData.url}
          alt={apodData.title}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, 640px"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <p className="truncate text-xs font-medium text-[#E8E8FF]">{apodData.title}</p>
          {apodData.copyright && (
            <p className="text-[10px] text-[#E8E8FF]/50">© {apodData.copyright}</p>
          )}
        </div>
      </div>

      {!answered && (
        <button
          onClick={toggleRisk}
          className={`w-full rounded-xl border py-2 text-sm font-semibold transition-all duration-200 ${
            isRisk
              ? 'border-[#F44336] bg-[#F44336]/20 text-[#F44336]'
              : 'border-[#1a237e]/40 bg-[#1a237e]/20 text-[#E8E8FF]/60 hover:border-[#FF6B35]/40'
          }`}
        >
          {isRisk
            ? '⚠️ 위험 탐사 모드 (보상 2.4×, 실패 시 -20 XP)'
            : '안전 탐사 모드 — 클릭하여 위험 탐사로 전환'}
        </button>
      )}

      <div className="rounded-2xl border border-[#1a237e]/40 bg-[#1a237e]/20 px-4 py-3">
        <p className="text-base font-semibold leading-relaxed text-[#E8E8FF]">{question.text}</p>
        {answered && (
          <p className="mt-2 text-xs leading-relaxed text-[#E8E8FF]/60">
            {apodData.explanation.slice(0, 180)}...
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            disabled={answered || eliminatedChoices.includes(index)}
            onClick={() => !answered && submitAnswer(index)}
            className={choiceStyle(index)}
          >
            <span className="mr-2 text-[#E8E8FF]/40">{String.fromCharCode(65 + index)}.</span>
            {choice}
          </button>
        ))}
      </div>

      {!answered && equipment.analyzer.uses > 0 && (
        <button
          onClick={useAnalyzer}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#FF6B35]/40 px-4 py-2 text-sm text-[#FF6B35] transition-all hover:bg-[#FF6B35]/10"
        >
          🔍 분석기 사용 (오답 1개 제거) — {equipment.analyzer.uses}회 남음
        </button>
      )}

      {eliminatedChoices.length > 0 && !answered && (
        <div className="px-2 text-xs text-[#E8E8FF]/50">💡 힌트: {question.hint}</div>
      )}
    </div>
  )
}
