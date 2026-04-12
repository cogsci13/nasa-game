'use client'

import Link from 'next/link'
import ProgressHUD from '@/components/game/ProgressHUD'
import { getCollectionBadges, getNextRegion } from '@/lib/game/progression'
import { useMetaStore } from '@/store/metaStore'

function HomeHero() {
  const xp = useMetaStore((state) => state.xp)
  const streak = useMetaStore((state) => state.dailyMission.streak)
  const stats = useMetaStore((state) => state.stats)
  const unlockedBadgeIds = useMetaStore((state) => state.unlockedBadgeIds)
  const weeklyGoals = useMetaStore((state) => state.weeklyGoals)
  const recentArcadeRuns = useMetaStore((state) => state.recentArcadeRuns)
  const claimWeeklyGoal = useMetaStore((state) => state.claimWeeklyGoal)
  const nextRegion = getNextRegion(xp)
  const unlockedBadges = getCollectionBadges(unlockedBadgeIds).filter((badge) => badge.unlocked)
  const featuredGoals = weeklyGoals.goals.slice(0, 2)

  return (
    <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1a237e]/40 via-[#0c1025] to-[#FF6B35]/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF6B35]">
        Mission Control
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white">
        NASA 데이터를 캐주얼 게임처럼 즐기는 우주 탐사 허브
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
        매일 한 번 도전하는 미션과 짧은 아케이드 런을 오가며 XP를 쌓고, 실시간 트래커로
        오늘의 우주 이벤트까지 확인하세요.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <HeroStat label="스트릭" value={`${streak}일`} />
        <HeroStat label="획득 배지" value={`${unlockedBadges.length}`} />
        <HeroStat label="아케이드 기록" value={`${stats.arcadeRuns}회`} />
      </div>

      {nextRegion && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
          다음 해금 구역은 <span className="font-semibold text-white">{nextRegion.name}</span>이며,
          레벨 {nextRegion.minLevel}부터 개방됩니다.
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {featuredGoals.map((goal) => (
          <div key={goal.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">{goal.label}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{goal.description}</p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/65">
                +{goal.rewardXP} XP
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#FF6B35]"
                style={{ width: `${(goal.progress / goal.target) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/45">
                {goal.progress}/{goal.target}
              </span>
              {goal.completed && !goal.claimed ? (
                <button
                  onClick={() => claimWeeklyGoal(goal.id)}
                  className="rounded-full bg-[#FF6B35] px-3 py-1.5 text-xs font-bold text-white"
                >
                  보상 수령
                </button>
              ) : (
                <span className="text-xs font-semibold text-white/50">
                  {goal.claimed ? '수령 완료' : goal.completed ? '완료' : '진행 중'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">최근 아케이드 런</p>
            <p className="mt-1 text-xs text-white/45">
              최고 콤보 {stats.bestArcadeCombo}, 특수 라운드 최고 성공 {stats.bestSpecialSuccesses}
            </p>
          </div>
          <Link
            href="/collection"
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70"
          >
            전체 기록
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {recentArcadeRuns.length > 0 ? (
            recentArcadeRuns.slice(0, 3).map((run) => (
              <div key={run.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{run.score}점</span>
                  <span className="text-xs font-semibold text-[#FF6B35]">+{run.rewardXP} XP</span>
                </div>
                <p className="mt-2 text-xs text-white/45">{formatRunDate(run.finishedAt)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-white/60">
                  <RunChip label="라운드" value={`${run.roundsCleared}`} />
                  <RunChip label="콤보" value={`${run.bestCombo}`} />
                  <RunChip label="특수" value={`${run.specialSuccesses}`} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/45 md:col-span-3">
              아직 저장된 런 기록이 없습니다. 아케이드 모드에서 한 판 완료하면 여기 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const MODES = [
  {
    href: '/daily',
    eyebrow: 'Daily Challenge',
    title: '오늘의 미션',
    description: 'NASA APOD 한 장으로 하루 한 번 푸는 대표 미션입니다.',
    accent: 'from-[#FF6B35]/30 to-[#1a237e]/10',
    cta: '오늘의 문제 풀기',
  },
  {
    href: '/play',
    eyebrow: 'Arcade Run',
    title: '빠른 탐사',
    description: '5라운드 세션으로 템포 있게 즐기는 캐주얼 퀴즈 모드입니다.',
    accent: 'from-emerald-400/20 to-sky-500/10',
    cta: '아케이드 시작',
  },
  {
    href: '/tracker',
    eyebrow: 'Live Tracker',
    title: '실시간 추적',
    description: 'ISS, 허블, 텐궁과 우주인 현황을 확인하는 이벤트 허브입니다.',
    accent: 'from-fuchsia-400/20 to-slate-500/10',
    cta: '트래커 열기',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <ProgressHUD />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <HomeHero />

        <section className="grid gap-4 lg:grid-cols-3">
          {MODES.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${mode.accent} p-5 transition-transform hover:-translate-y-0.5`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                {mode.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-bold text-white">{mode.title}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-white/60">{mode.description}</p>
              <div className="mt-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {mode.cta}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  )
}

function RunChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-2">
      <p className="text-[10px] text-white/35">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  )
}

function formatRunDate(input: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(input))
}
