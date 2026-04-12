'use client'

import ProgressHUD from '@/components/game/ProgressHUD'
import { getCollectionBadges, getNextRegion, getUnlockedRegions } from '@/lib/game/progression'
import { useMetaStore } from '@/store/metaStore'
import { getCurrentRegion, getLevel } from '@/types/meta'

function CollectionContent() {
  const xp = useMetaStore((state) => state.xp)
  const streak = useMetaStore((state) => state.dailyMission.streak)
  const analyzerUses = useMetaStore((state) => state.equipment.analyzer.uses)
  const stats = useMetaStore((state) => state.stats)
  const unlockedRegionIds = useMetaStore((state) => state.unlockedRegionIds)
  const unlockedBadgeIds = useMetaStore((state) => state.unlockedBadgeIds)
  const weeklyGoals = useMetaStore((state) => state.weeklyGoals)
  const recentArcadeRuns = useMetaStore((state) => state.recentArcadeRuns)
  const claimWeeklyGoal = useMetaStore((state) => state.claimWeeklyGoal)

  const level = getLevel(xp)
  const currentRegion = getCurrentRegion(level)
  const unlockedRegions = getUnlockedRegions(xp).filter((region) => unlockedRegionIds.includes(region.id))
  const nextRegion = getNextRegion(xp)
  const badges = getCollectionBadges(unlockedBadgeIds)

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <ProgressHUD />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF6B35]">
            Collection
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">탐사 기록 보관소</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            현재 해금한 구역과 배지를 확인하고, 다음 탐사 목표가 어디인지 한 번에 확인하세요.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">현재 상태</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <CollectionStat label="현재 레벨" value={`Lv.${level}`} accent="#FF6B35" />
              <CollectionStat label="현재 구역" value={currentRegion.name} accent="#60a5fa" />
              <CollectionStat label="스트릭" value={`${streak}일`} accent="#facc15" />
            </div>
            {nextRegion && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                다음 해금 목표는 <span className="font-semibold text-white">{nextRegion.name}</span>이며,
                레벨 {nextRegion.minLevel}부터 진입할 수 있습니다.
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">장비 현황</p>
            <div className="mt-4 rounded-2xl border border-[#FF6B35]/20 bg-[#FF6B35]/8 p-4">
              <p className="text-sm text-white/60">분석기 잔여 횟수</p>
              <p className="mt-2 text-3xl font-black text-[#FF6B35]">{analyzerUses}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <CollectionStat label="데일리 완료" value={`${stats.dailyCompletions}`} accent="#86efac" />
              <CollectionStat label="최고 점수" value={`${stats.bestArcadeScore}`} accent="#f472b6" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <CollectionStat label="최고 콤보" value={`${stats.bestArcadeCombo}`} accent="#a78bfa" />
              <CollectionStat label="특수 라운드" value={`${stats.bestSpecialSuccesses}`} accent="#f97316" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">해금 구역</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedRegions.map((region) => (
              <div key={region.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-lg font-bold text-white">{region.name}</p>
                <p className="mt-2 text-sm text-white/55">{region.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">최근 런 기록</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {recentArcadeRuns.length > 0 ? (
              recentArcadeRuns.map((run) => (
                <div key={run.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {run.perfect ? '퍼펙트 런' : '아케이드 런'} · {run.score}점
                      </p>
                      <p className="mt-1 text-xs text-white/45">{formatRunDate(run.finishedAt)}</p>
                    </div>
                    <span className="rounded-full bg-[#FF6B35]/15 px-3 py-1 text-xs font-semibold text-[#FF6B35]">
                      +{run.rewardXP} XP
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <CollectionStatMini label="라운드" value={`${run.roundsCleared}`} />
                    <CollectionStatMini label="생명" value={`${run.livesLeft}`} />
                    <CollectionStatMini label="콤보" value={`${run.bestCombo}`} />
                    <CollectionStatMini label="특수" value={`${run.specialSuccesses}`} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/45 lg:col-span-2">
                저장된 런 기록이 없습니다. 아케이드 모드에서 XP를 수령하면 최근 기록이 추가됩니다.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">주간 목표</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {weeklyGoals.goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{goal.label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">{goal.description}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/70">
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
                      수령
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
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">배지</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 ${
                  badge.unlocked
                    ? 'border-emerald-400/30 bg-emerald-400/10'
                    : 'border-white/10 bg-black/20'
                }`}
              >
                <p className="text-sm font-bold text-white">{badge.label}</p>
                <p className="mt-2 text-xs leading-5 text-white/55">{badge.description}</p>
                <p className="mt-4 text-xs font-semibold" style={{ color: badge.unlocked ? '#86efac' : '#94a3b8' }}>
                  {badge.unlocked ? '획득' : '잠김'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function CollectionPage() {
  return <CollectionContent />
}

function CollectionStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

function CollectionStatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
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
