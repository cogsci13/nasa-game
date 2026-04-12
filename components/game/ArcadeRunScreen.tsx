'use client'

import { useEffect } from 'react'
import type { QuestionCategory } from '@/lib/questions'
import { calculateArcadeReward } from '@/lib/game/arcade'
import { useRunStore } from '@/store/runStore'
import { useMetaStore } from '@/store/metaStore'
import { getLevel } from '@/types/meta'
import { ARCADE_ROUND_TIME, ARCADE_TOTAL_ROUNDS } from '@/types/run'

const CATEGORY_META: Record<
  QuestionCategory,
  { label: string; icon: string; accent: string; panel: string; blurb: string }
> = {
  galaxy: {
    label: '은하 구역',
    icon: '🌌',
    accent: '#60a5fa',
    panel: 'from-sky-500/20 to-indigo-500/10',
    blurb: '거대한 구조와 중심부의 특징을 빠르게 판별하세요.',
  },
  nebula: {
    label: '성운 지대',
    icon: '☁️',
    accent: '#f97316',
    panel: 'from-orange-500/20 to-pink-500/10',
    blurb: '가스와 먼지 속에서 힌트를 읽어내는 라운드입니다.',
  },
  planet: {
    label: '행성 구역',
    icon: '🪐',
    accent: '#facc15',
    panel: 'from-yellow-500/20 to-orange-500/10',
    blurb: '태양계와 행성 지식을 정면으로 묻습니다.',
  },
  spacecraft: {
    label: '탐사 장비 구역',
    icon: '🚀',
    accent: '#34d399',
    panel: 'from-emerald-500/20 to-cyan-500/10',
    blurb: '망원경과 우주선 관련 문제로 템포를 올립니다.',
  },
  star_cluster: {
    label: '성단 구역',
    icon: '✨',
    accent: '#a78bfa',
    panel: 'from-violet-500/20 to-sky-500/10',
    blurb: '별의 분포와 집단 구조를 구분해야 합니다.',
  },
  solar_system: {
    label: '태양 활동 구역',
    icon: '☀️',
    accent: '#fb7185',
    panel: 'from-rose-500/20 to-amber-500/10',
    blurb: '태양과 근접 천체의 기본 상식을 시험합니다.',
  },
  black_hole: {
    label: '중력 이상 구역',
    icon: '🕳️',
    accent: '#c084fc',
    panel: 'from-fuchsia-500/20 to-violet-500/10',
    blurb: '강착 원반과 사건의 지평선을 구분하는 고위험 라운드입니다.',
  },
  unknown: {
    label: '미확인 구역',
    icon: '🛰️',
    accent: '#94a3b8',
    panel: 'from-slate-500/20 to-slate-700/10',
    blurb: '기본 우주 상식으로 안전하게 점수를 쌓는 라운드입니다.',
  },
}

export default function ArcadeRunScreen() {
  const xp = useMetaStore((state) => state.xp)
  const arcadeSession = useRunStore((state) => state.arcadeSession)
  const startArcadeRun = useRunStore((state) => state.startArcadeRun)
  const answerArcadeRound = useRunStore((state) => state.answerArcadeRound)
  const tickArcadeTimer = useRunStore((state) => state.tickArcadeTimer)
  const useArcadePowerup = useRunStore((state) => state.useArcadePowerup)
  const advanceArcadeRound = useRunStore((state) => state.advanceArcadeRound)
  const finishArcadeRun = useRunStore((state) => state.finishArcadeRun)
  const claimArcadeReward = useRunStore((state) => state.claimArcadeReward)

  useEffect(() => {
    if (!arcadeSession) {
      startArcadeRun()
    }
  }, [arcadeSession, startArcadeRun])

  useEffect(() => {
    if (!arcadeSession || arcadeSession.status !== 'active' || arcadeSession.selectedIndex !== null) {
      return
    }

    const timerId = window.setInterval(() => {
      tickArcadeTimer()
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [arcadeSession, tickArcadeTimer])

  useEffect(() => {
    if (!arcadeSession || arcadeSession.status !== 'completed' || arcadeSession.rewardClaimed) return
    claimArcadeReward()
  }, [arcadeSession, claimArcadeReward])

  if (!arcadeSession) {
    return null
  }

  const {
    rounds,
    roundIndex,
    score,
    combo,
    lives,
    selectedIndex,
    eliminatedChoices,
    status,
    timeLeft,
    rewardClaimed,
    powerups,
    shieldArmed,
    trackerBonuses,
  } = arcadeSession

  const currentRound = rounds[roundIndex]
  const currentQuestion = currentRound?.question
  const categoryMeta = currentQuestion ? CATEGORY_META[currentQuestion.category] : null
  const currentEvent = currentRound?.event
  const currentSpecial = currentRound?.special
  const sessionEnded = status === 'completed'
  const correct = selectedIndex !== null && currentQuestion
    ? selectedIndex === currentQuestion.correctIndex
    : false

  const earnedXP = calculateArcadeReward(score, lives, powerups)
  const appliedRewardXP = rewardClaimed ? xp : xp + earnedXP
  const levelAfterReward = getLevel(appliedRewardXP)

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <header className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF6B35]">
              Arcade Run
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">빠른 탐사</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              다섯 라운드 안에 최대한 많은 점수를 쌓으세요. 정답을 이어가면 콤보가 커지고,
              남은 시간이 많을수록 보상이 올라갑니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <ArcadeStat label="라운드" value={`${Math.min(roundIndex + 1, ARCADE_TOTAL_ROUNDS)}/${ARCADE_TOTAL_ROUNDS}`} />
            <ArcadeStat label="점수" value={score.toString()} accent="#FF6B35" />
            <ArcadeStat label="콤보" value={`x${combo}`} accent="#4ade80" />
            <ArcadeStat label="생명" value={'❤️'.repeat(Math.max(lives, 1))} accent="#fb7185" />
          </div>
        </header>

        {!sessionEnded && currentQuestion && categoryMeta && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={`rounded-[32px] border border-white/10 bg-gradient-to-br ${categoryMeta.panel} p-6`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                    <span>{categoryMeta.icon}</span>
                    <span>{categoryMeta.label}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">{currentQuestion.text}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{categoryMeta.blurb}</p>
                </div>
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 text-3xl"
                  style={{ backgroundColor: `${categoryMeta.accent}22` }}
                >
                  {categoryMeta.icon}
                </div>
              </div>

              <div className="mt-6">
                {currentEvent && (
                  <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Event Card
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">{currentEvent.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{currentEvent.description}</p>
                  </div>
                )}
                {currentSpecial && (
                  <div className="mb-4 rounded-2xl border border-[#FF6B35]/20 bg-[#FF6B35]/8 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Special Round
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">{currentSpecial.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{currentSpecial.description}</p>
                    <p className="mt-3 text-xs font-semibold text-[#FF6B35]">{currentSpecial.rewardText}</p>
                  </div>
                )}
                <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                  <span>타이머</span>
                  <span>{timeLeft}s</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(timeLeft / ARCADE_ROUND_TIME) * 100}%`,
                      backgroundColor: categoryMeta.accent,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedIndex === index
                  const isCorrect = selectedIndex !== null && index === currentQuestion.correctIndex
                  const isWrongTimeout = selectedIndex === -1
                  const isEliminated = eliminatedChoices.includes(index)

                  let className =
                    'w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition-all '

                  if (isEliminated) {
                    className += 'border-white/10 bg-[#11162b] text-white/25 line-through opacity-40'
                  } else if (selectedIndex === null) {
                    className += 'border-white/10 bg-[#11162b] text-white hover:border-white/30 hover:bg-[#182040]'
                  } else if (isCorrect) {
                    className += 'border-[#4ade80]/60 bg-[#4ade80]/10 text-[#86efac]'
                  } else if (isSelected) {
                    className += 'border-[#fb7185]/60 bg-[#fb7185]/10 text-[#fda4af]'
                  } else {
                    className += 'border-white/10 bg-[#11162b] text-white/40'
                  }

                  if (isWrongTimeout && index !== currentQuestion.correctIndex) {
                    className += ' opacity-40'
                  }

                  return (
                    <button
                      key={`${currentRound.id}-${index}`}
                      onClick={() => answerArcadeRound(index)}
                      disabled={selectedIndex !== null || isEliminated}
                      className={className}
                    >
                      <span className="mr-3 text-white/35">{String.fromCharCode(65 + index)}.</span>
                      {choice}
                    </button>
                  )
                })}
              </div>
            </div>

            <aside className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
                  Round Intel
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">
                  {selectedIndex === null ? '판단 후 즉시 선택' : correct ? '정답으로 콤보 유지' : '리듬을 다시 잡기'}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {selectedIndex === null
                    ? '빠르게 고르면 시간 보너스가 커집니다. 틀리면 생명이 줄고 콤보가 초기화됩니다.'
                    : selectedIndex === -1
                    ? '시간이 종료되어 생명이 감소했습니다. 다음 라운드에서 다시 점수를 쌓으세요.'
                    : correct
                    ? `이번 라운드 보정으로 x${combo} 콤보를 유지 중입니다.`
                    : `정답은 "${currentQuestion.choices[currentQuestion.correctIndex]}" 입니다.`}
                </p>
                {currentSpecial?.kind === 'tracker-lock' && (
                  <p className="mt-3 text-xs text-white/45">
                    성공하면 보호막이 1회 보급됩니다. 현재 보호막 잔량은 {powerups.shield}회입니다.
                  </p>
                )}
                {currentSpecial?.kind === 'apod-briefing' && (
                  <p className="mt-3 text-xs text-white/45">
                    APOD 브리핑 라운드는 정답 시 추가 점수 45점을 제공합니다.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/40">예상 세션 보상</p>
                <p className="mt-2 text-2xl font-bold text-[#FF6B35]">+{earnedXP} XP</p>
                <p className="mt-1 text-xs text-white/40">런 종료 시 즉시 지급</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Powerups
                </p>
                <div className="mt-3 grid gap-2">
                  <PowerupButton
                    label={`보호막 ${shieldArmed ? '(활성)' : ''}`}
                    description="다음 피해를 한 번 막습니다"
                    count={powerups.shield}
                    disabled={selectedIndex !== null}
                    onClick={() => useArcadePowerup('shield')}
                  />
                  <PowerupButton
                    label="스캐너"
                    description="오답 하나를 제거합니다"
                    count={powerups.scanner}
                    disabled={selectedIndex !== null}
                    onClick={() => useArcadePowerup('scanner')}
                  />
                  <PowerupButton
                    label="타임 워프"
                    description="남은 시간을 5초 늘립니다"
                    count={powerups['time-warp']}
                    disabled={selectedIndex !== null}
                    onClick={() => useArcadePowerup('time-warp')}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Tracker Sync
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {trackerBonuses.featuredSatellite.emoji} {trackerBonuses.featuredSatellite.label}
                </p>
                <div className="mt-3 space-y-2">
                  {trackerBonuses.boosts.length > 0 ? (
                    trackerBonuses.boosts.map((boost) => (
                      <div key={boost.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-xs font-semibold text-white">{boost.title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-white/50">{boost.rewardText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/45">
                      아직 활성화된 트래커 보정이 없습니다. 진행도를 올리면 시작 보너스가 붙습니다.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={roundIndex >= rounds.length - 1 || lives <= 0 ? finishArcadeRun : advanceArcadeRound}
                disabled={selectedIndex === null}
                className="mt-auto rounded-2xl bg-[#FF6B35] px-4 py-4 text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                {roundIndex >= rounds.length - 1 || lives <= 0 ? '결과 보기' : '다음 라운드'}
              </button>
            </aside>
          </section>
        )}

        {sessionEnded && (
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF6B35]">
              Run Complete
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">세션 종료</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60">
              {lives > 0
                ? '다섯 라운드를 끝까지 완주했습니다.'
                : '생명을 모두 잃어 탐사가 종료되었습니다. 다음 런에서 더 빠르게 콤보를 쌓아 보세요.'}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <ArcadeStat label="최종 점수" value={score.toString()} accent="#FF6B35" />
              <ArcadeStat label="획득 XP" value={`+${earnedXP}`} accent="#facc15" />
              <ArcadeStat label="최종 콤보" value={`x${combo}`} accent="#4ade80" />
              <ArcadeStat label="도달 레벨" value={`Lv.${levelAfterReward}`} accent="#60a5fa" />
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={startArcadeRun}
                className="rounded-2xl bg-[#FF6B35] px-6 py-4 text-base font-bold text-white"
              >
                다시 탐사하기
              </button>
              <a
                href="/daily"
                className="rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-white/80 hover:bg-white/5"
              >
                오늘의 미션으로 이동
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ArcadeStat({
  label,
  value,
  accent = '#E8E8FF',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

function PowerupButton({
  label,
  description,
  count,
  disabled,
  onClick,
}: {
  label: string
  description: string
  count: number
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || count <= 0}
      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/65">
          {count}회
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-white/50">{description}</p>
    </button>
  )
}
