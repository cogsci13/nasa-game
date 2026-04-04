'use client'

import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'

export default function QuizCard() {
  const currentMission = useGameStore((s) => s.currentMission)
  const equipment = useGameStore((s) => s.equipment)
  const toggleRisk = useGameStore((s) => s.toggleRisk)
  const useAnalyzer = useGameStore((s) => s.useAnalyzer)
  const submitAnswer = useGameStore((s) => s.submitAnswer)

  if (!currentMission) return null

  const { apodData, question, selectedIndex, isRisk, eliminatedChoices } = currentMission
  const answered = selectedIndex !== null

  function choiceStyle(index: number): string {
    const base =
      'w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border '

    if (eliminatedChoices.includes(index)) {
      return base + 'opacity-30 cursor-not-allowed bg-[#1a237e]/20 border-[#1a237e]/20 text-[#E8E8FF]/40 line-through'
    }

    if (!answered) {
      return (
        base +
        'bg-[#1a237e]/30 border-[#1a237e]/60 text-[#E8E8FF] hover:bg-[#1a237e]/60 hover:border-[#FF6B35]/60 active:scale-[0.98] cursor-pointer'
      )
    }

    if (index === question.correctIndex) {
      return base + 'bg-[#4CAF50]/20 border-[#4CAF50] text-[#4CAF50] font-bold'
    }

    if (index === selectedIndex) {
      return base + 'bg-[#F44336]/20 border-[#F44336] text-[#F44336]'
    }

    return base + 'opacity-40 bg-[#1a237e]/20 border-[#1a237e]/20 text-[#E8E8FF]/40'
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 py-4">
      {/* APOD Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1a237e]/20">
        <Image
          src={apodData.url}
          alt={apodData.title}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, 640px"
          priority
        />
        {/* Image overlay: title + copyright */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <p className="text-[#E8E8FF] text-xs font-medium truncate">{apodData.title}</p>
          {apodData.copyright && (
            <p className="text-[#E8E8FF]/50 text-[10px]">© {apodData.copyright}</p>
          )}
        </div>
      </div>

      {/* Risk toggle */}
      {!answered && (
        <button
          onClick={toggleRisk}
          className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            isRisk
              ? 'bg-[#F44336]/20 border-[#F44336] text-[#F44336]'
              : 'bg-[#1a237e]/20 border-[#1a237e]/40 text-[#E8E8FF]/60 hover:border-[#FF6B35]/40'
          }`}
        >
          {isRisk ? '⚠️ 위험 탐사 모드 (보상 2.4×, 실패 시 -20 XP)' : '안전 탐사 모드 — 클릭하여 위험 탐사로 전환'}
        </button>
      )}

      {/* Question */}
      <div className="bg-[#1a237e]/20 rounded-2xl px-4 py-3 border border-[#1a237e]/40">
        <p className="text-[#E8E8FF] font-semibold text-base leading-relaxed">{question.text}</p>
        {answered && (
          <p className="text-[#E8E8FF]/60 text-xs mt-2 leading-relaxed">{apodData.explanation.slice(0, 180)}...</p>
        )}
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            disabled={answered || eliminatedChoices.includes(i)}
            onClick={() => !answered && submitAnswer(i)}
            className={choiceStyle(i)}
          >
            <span className="mr-2 text-[#E8E8FF]/40">{String.fromCharCode(65 + i)}.</span>
            {choice}
          </button>
        ))}
      </div>

      {/* Analyzer equipment */}
      {!answered && equipment.analyzer.uses > 0 && (
        <button
          onClick={useAnalyzer}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[#FF6B35]/40 text-[#FF6B35] text-sm hover:bg-[#FF6B35]/10 transition-all"
        >
          🔍 분석기 사용 (오답 1개 제거) — {equipment.analyzer.uses}회 남음
        </button>
      )}

      {/* Hint shown if analyzer was used */}
      {eliminatedChoices.length > 0 && !answered && (
        <div className="text-[#E8E8FF]/50 text-xs px-2">
          💡 힌트: {question.hint}
        </div>
      )}
    </div>
  )
}
