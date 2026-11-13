import { prisma } from "@/lib/prisma"
import { startOfMonth, startOfWeek } from "@/lib/format"
import {
  needsPermissionsRecheck,
  recheckGarminPermissions,
  sharingState,
} from "@/lib/garmin/permissions"

// ─────────────────────────────────────────────────────────────
// Tipos que consume la UI del dashboard
// ─────────────────────────────────────────────────────────────

export type ActivityRow = {
  id: string
  title: string
  type: string // RUN, TRAIL_RUN, ...
  distanceMeters: number
  durationSeconds: number
  avgPaceSecPerKm: number | null
  date: Date
  source: string // GARMIN, STRAVA, MANUAL, ...
}

export type PersonalRecordRow = {
  /** Enum PRDistance (ONE_K, FIVE_K, ...) — la UI lo traduce vía namespace. */
  key: string
  durationSeconds: number
}

export type ClubSummary = {
  name: string
  slug: string
  city: string | null
  country: string
  memberCount: number
  logoUrl: string | null
  /** Posición del club en el leaderboard global. null = aún sin ranking calculado. */
  rank: number | null
  /** Cambio de posición vs el periodo anterior (+sube, -baja). */
  rankDelta: number
  totalDistanceMeters: number
  /** Distancia que falta para alcanzar al club de arriba. null si ya es #1 o sin datos. */
  gapToNextMeters: number | null
  nextRivalName: string | null
}

export type ContributionSummary = {
  /** km que el usuario aportó al club en el periodo (semana en curso). */
  distanceMeters: number
  activities: number
  /** Posición del usuario entre los contribuidores del club. null = sin ranking. */
  rankInClub: number | null
  totalContributors: number
  /** % del total del club que representa el aporte del usuario. */
  sharePct: number
}

export type PersonalSummary = {
  weekDistanceMeters: number
  monthDistanceMeters: number
  streakDays: number
  avgPaceSecPerKm: number | null
  records: PersonalRecordRow[]
}

export type HeroSummary = {
  /** Posición del usuario dentro del club por km (semana en curso). null = sin ranking. */
  weeklyRank: number | null
  weeklyDistanceMeters: number
  /** Posición del usuario dentro del club por km (mes en curso). */
  monthlyRank: number | null
  monthlyDistanceMeters: number
  /** Km totales que el usuario ha aportado al club (histórico). */
  contributionMeters: number
  /** % del total histórico del club que representa el aporte del usuario. */
  productivityPct: number
}

export type ClubFeedRow = {
  id: string
  name: string
  distanceMeters: number
  activityType: string
  date: Date
}

/** The runner's active club membership (hero: "Running with … · Since …"). */
export type DashboardMembership = {
  clubName: string
  clubSlug: string
  logoUrl: string | null
  joinedAt: Date
} | null

/** One leaderboard position: competition ranking (ties share a place: 1, 1, 3). */
export type RankPosition = {
  /** null = no counted km in the period yet. */
  rank: number | null
  /** Runners with counted km in the period. */
  runners: number
  distanceMeters: number
}

/** Dashboard ranking grid. Months are UTC (one calendar for the global leaderboard). */
export type RankingSummary = {
  /** Every W3Runn3rs runner (runs that count for a club), month to date. */
  globalMonthly: RankPosition
  /** Members of the runner's club, month to date. null = no club. */
  clubMonthly: RankPosition | null
  /** Km the runner has added to their current club (all time). */
  contributionMeters: number
  /** contributionMeters as % of everything the club has added (all time). */
  productivityPct: number
}

export type DashboardData = {
  /**
   * true cuando el usuario aún no tiene actividades: club/hero/contribution/personal/
   * clubFeed son datos de muestra (perfil público y secciones de abajo del dashboard).
   * membership, ranking, recent y bannerUrl son siempre reales.
   */
  isSample: boolean
  membership: DashboardMembership
  ranking: RankingSummary
  /** The runner's own dashboard banner (Vercel Blob). */
  bannerUrl: string | null
  /** Their club's banner — shown when the runner hasn't set their own. */
  clubBannerUrl: string | null
  deviceConnected: boolean
  /** Connected, but the user didn't share activities (Garmin ACTIVITY_EXPORT off). */
  activitySharingOff: boolean
  club: ClubSummary | null
  hero: HeroSummary
  contribution: ContributionSummary
  personal: PersonalSummary
  recent: ActivityRow[]
  /** Últimas actividades de los miembros del club. Simuladas hasta que existan datos reales. */
  clubFeed: ClubFeedRow[]
}

// Feed simulado del club — placeholder hasta que haya actividades reales de miembros.
function simulatedClubFeed(now = new Date()): ClubFeedRow[] {
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000)
  return [
    { id: "cf1", name: "Ana Torres", distanceMeters: 12_500, activityType: "RUN", date: daysAgo(0) },
    { id: "cf2", name: "Luis Gómez", distanceMeters: 8_200, activityType: "RUN", date: daysAgo(0) },
    { id: "cf3", name: "Sofía Ramírez", distanceMeters: 21_100, activityType: "RUN", date: daysAgo(1) },
    { id: "cf4", name: "Diego Herrera", distanceMeters: 6_400, activityType: "TRAIL_RUN", date: daysAgo(2) },
    { id: "cf5", name: "Mariana López", distanceMeters: 15_000, activityType: "RUN", date: daysAgo(3) },
    { id: "cf6", name: "Carlos Mendoza", distanceMeters: 10_000, activityType: "RUN", date: daysAgo(4) },
  ]
}

// ─────────────────────────────────────────────────────────────
// Dataset de muestra — se usa cuando el usuario aún no registró
// actividades, para que el diseño del dashboard se vea completo.
// Marcado con isSample: true para mostrar el badge "Datos de muestra".
// ─────────────────────────────────────────────────────────────

const EMPTY_RANKING: RankingSummary = {
  globalMonthly: { rank: null, runners: 0, distanceMeters: 0 },
  clubMonthly: null,
  contributionMeters: 0,
  productivityPct: 0,
}

function sampleData(): DashboardData {
  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000)
  return {
    isSample: true,
    membership: null,
    ranking: EMPTY_RANKING,
    bannerUrl: null,
    clubBannerUrl: null,
    deviceConnected: false,
    activitySharingOff: false,
    club: {
      name: "Pacers CDMX",
      slug: "pacers-cdmx",
      city: "Ciudad de México",
      country: "MX",
      memberCount: 128,
      logoUrl: null,
      rank: 4,
      rankDelta: 2,
      totalDistanceMeters: 1_098_000,
      gapToNextMeters: 53_000,
      nextRivalName: "NNC Berlin",
    },
    hero: {
      weeklyRank: 7,
      weeklyDistanceMeters: 42_300,
      monthlyRank: 5,
      monthlyDistanceMeters: 168_500,
      contributionMeters: 1_240_000,
      productivityPct: 8.4,
    },
    contribution: {
      distanceMeters: 42_300,
      activities: 4,
      rankInClub: 7,
      totalContributors: 96,
      sharePct: 3.9,
    },
    personal: {
      weekDistanceMeters: 42_300,
      monthDistanceMeters: 168_500,
      streakDays: 12,
      avgPaceSecPerKm: 312, // 5:12 /km
      records: [
        { key: "FIVE_K", durationSeconds: 1_290 },
        { key: "TEN_K", durationSeconds: 2_760 },
        { key: "HALF_MARATHON", durationSeconds: 6_240 },
      ],
    },
    recent: [
      { id: "s1", title: "Carrera matutina", type: "RUN", distanceMeters: 12_400, durationSeconds: 3_780, avgPaceSecPerKm: 305, date: daysAgo(0), source: "GARMIN" },
      { id: "s2", title: "Intervalos en pista", type: "RUN", distanceMeters: 8_000, durationSeconds: 2_280, avgPaceSecPerKm: 285, date: daysAgo(2), source: "GARMIN" },
      { id: "s3", title: "Tirada larga", type: "RUN", distanceMeters: 18_900, durationSeconds: 6_120, avgPaceSecPerKm: 324, date: daysAgo(4), source: "STRAVA" },
      { id: "s4", title: "Trote de recuperación", type: "RUN", distanceMeters: 6_000, durationSeconds: 2_040, avgPaceSecPerKm: 340, date: daysAgo(6), source: "MANUAL" },
    ],
    clubFeed: simulatedClubFeed(),
  }
}

// ─────────────────────────────────────────────────────────────
// Carga real desde Prisma. Si el usuario no tiene actividades,
// devuelve el dataset de muestra para que el dashboard sea legible.
// ─────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const [user, membership, recentActivities, prRecords, weekAgg, monthAgg] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          bannerUrl: true,
          connectedProvider: true,
          garminConnection: {
            select: { isActive: true, permissions: true, permissionsUpdatedAt: true },
          },
        },
      }),
      // activeUserId is the one-active-club guarantee (unique while active).
      prisma.clubMembership.findUnique({
        where: { activeUserId: userId },
        include: { club: true },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { activityDate: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          activityType: true,
          distanceMeters: true,
          durationSeconds: true,
          avgPaceSecPerKm: true,
          activityDate: true,
          source: true,
        },
      }),
      prisma.personalRecord.findMany({
        where: { userId },
        select: { distance: true, durationSeconds: true },
      }),
      prisma.activity.aggregate({
        where: { userId, activityDate: { gte: weekStart } },
        _sum: { distanceMeters: true },
        _count: true,
      }),
      prisma.activity.aggregate({
        where: { userId, activityDate: { gte: monthStart } },
        _sum: { distanceMeters: true },
      }),
    ])

  // El estado del dispositivo es siempre real, aunque el resto sea de muestra.
  const deviceConnected = Boolean(user?.connectedProvider)
  // Sharing off/unknown → ask Garmin again (rate-limited) before warning.
  let garmin = user?.garminConnection
  if (needsPermissionsRecheck(garmin)) {
    garmin = (await recheckGarminPermissions(userId)) ?? garmin
  }
  const activitySharingOff = Boolean(garmin?.isActive && sharingState(garmin) === "off")

  // Siempre reales, aunque el resto sea de muestra.
  const real = {
    deviceConnected,
    activitySharingOff,
    bannerUrl: user?.bannerUrl ?? null,
    clubBannerUrl: membership?.club?.bannerUrl ?? null,
    membership: membership?.club
      ? {
          clubName: membership.club.name,
          clubSlug: membership.club.slug,
          logoUrl: membership.club.logoUrl,
          joinedAt: membership.joinedAt,
        }
      : null,
    ranking: await getRankingSummary(userId, membership?.clubId ?? null),
  }

  // Sin actividades todavía → dataset de muestra para las secciones de abajo.
  if (recentActivities.length === 0) {
    return { ...sampleData(), ...real, recent: [] }
  }

  // ── Aporte al club (semana en curso) ──
  const weekDistance = weekAgg._sum.distanceMeters ?? 0
  const weekCount = weekAgg._count ?? 0
  const monthDistance = monthAgg._sum.distanceMeters ?? 0

  let club: ClubSummary | null = null
  let contribution: ContributionSummary = {
    distanceMeters: weekDistance,
    activities: weekCount,
    rankInClub: null,
    totalContributors: 0,
    sharePct: 0,
  }
  const hero: HeroSummary = {
    weeklyRank: null,
    weeklyDistanceMeters: weekDistance,
    monthlyRank: null,
    monthlyDistanceMeters: monthDistance,
    contributionMeters: 0,
    productivityPct: 0,
  }

  if (membership?.club) {
    const c = membership.club

    // Distancia total del club esta semana (todas las actividades atribuidas).
    const clubWeekAgg = await prisma.activity.aggregate({
      where: { clubId: c.id, activityDate: { gte: weekStart } },
      _sum: { distanceMeters: true },
    })
    const clubWeekDistance = clubWeekAgg._sum.distanceMeters ?? 0

    // Aporte por miembro esta semana, para sacar ranking de contribuidores.
    const perMember = await prisma.activity.groupBy({
      by: ["userId"],
      where: { clubId: c.id, activityDate: { gte: weekStart } },
      _sum: { distanceMeters: true },
    })
    const ranked = perMember
      .map((m) => ({ userId: m.userId, dist: m._sum.distanceMeters ?? 0 }))
      .sort((a, b) => b.dist - a.dist)
    const rankInClub = ranked.findIndex((m) => m.userId === userId)

    contribution = {
      distanceMeters: weekDistance,
      activities: weekCount,
      rankInClub: rankInClub >= 0 ? rankInClub + 1 : null,
      totalContributors: ranked.length,
      sharePct: clubWeekDistance > 0 ? (weekDistance / clubWeekDistance) * 100 : 0,
    }

    // Ranking mensual del usuario dentro del club.
    const perMemberMonth = await prisma.activity.groupBy({
      by: ["userId"],
      where: { clubId: c.id, activityDate: { gte: monthStart } },
      _sum: { distanceMeters: true },
    })
    const rankedMonth = perMemberMonth
      .map((m) => ({ userId: m.userId, dist: m._sum.distanceMeters ?? 0 }))
      .sort((a, b) => b.dist - a.dist)
    const monthlyRankIdx = rankedMonth.findIndex((m) => m.userId === userId)

    // Aporte histórico del usuario al club + productividad (% del total del club).
    const [userClubAgg, clubAllTimeAgg] = await Promise.all([
      prisma.activity.aggregate({
        where: { userId, clubId: c.id },
        _sum: { distanceMeters: true },
      }),
      prisma.activity.aggregate({
        where: { clubId: c.id },
        _sum: { distanceMeters: true },
      }),
    ])
    const contributionMeters = userClubAgg._sum.distanceMeters ?? 0
    const clubAllTime = clubAllTimeAgg._sum.distanceMeters ?? 0

    hero.weeklyRank = contribution.rankInClub
    hero.monthlyRank = monthlyRankIdx >= 0 ? monthlyRankIdx + 1 : null
    hero.contributionMeters = contributionMeters
    hero.productivityPct = clubAllTime > 0 ? (contributionMeters / clubAllTime) * 100 : 0

    club = {
      name: c.name,
      slug: c.slug,
      city: c.city,
      country: c.country,
      memberCount: c.memberCount,
      logoUrl: c.logoUrl,
      // El ranking global se calcula vía cron (ClubStats). Aún no implementado.
      rank: null,
      rankDelta: 0,
      totalDistanceMeters: clubWeekDistance,
      gapToNextMeters: null,
      nextRivalName: null,
    }
  }

  // ── Stats personales ──
  const paceSamples = recentActivities
    .map((a) => a.avgPaceSecPerKm)
    .filter((p): p is number => typeof p === "number" && p > 0)
  const avgPace =
    paceSamples.length > 0
      ? Math.round(paceSamples.reduce((s, p) => s + p, 0) / paceSamples.length)
      : null

  const personal: PersonalSummary = {
    weekDistanceMeters: weekDistance,
    monthDistanceMeters: monthAgg._sum.distanceMeters ?? 0,
    streakDays: computeStreak(recentActivities.map((a) => a.activityDate)),
    avgPaceSecPerKm: avgPace,
    // Solo récords de tiempo; LONGEST_RUN (distancia) se mostrará aparte.
    records: prRecords
      .filter((r): r is typeof r & { durationSeconds: number } => r.durationSeconds != null)
      .map((r) => ({ key: r.distance, durationSeconds: r.durationSeconds }))
      .slice(0, 4),
  }

  const recent: ActivityRow[] = recentActivities.map((a) => ({
    id: a.id,
    title: a.title ?? "Actividad",
    type: a.activityType,
    distanceMeters: a.distanceMeters,
    durationSeconds: a.durationSeconds,
    avgPaceSecPerKm: a.avgPaceSecPerKm,
    date: a.activityDate,
    source: a.source,
  }))

  return {
    isSample: false,
    ...real,
    club,
    hero,
    contribution,
    personal,
    recent,
    clubFeed: simulatedClubFeed(),
  }
}

// ─────────────────────────────────────────────────────────────
// Ranking: live aggregates over runs that count for a club
// (countsForLeaderboard = only device-recorded, plausible, non-duplicate runs
// of a club member after joining). Fine at today's scale; move to
// ClubStats / snapshots when it isn't.
// ─────────────────────────────────────────────────────────────

/** First instant of the current month in UTC. */
export function startOfMonthUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/** Competition ranking of `userId` among per-runner totals (ties share a place). */
export function rankPosition(
  totals: { userId: string; meters: number }[],
  userId: string
): RankPosition {
  const ranked = totals.filter((t) => t.meters > 0)
  const mine = ranked.find((t) => t.userId === userId)?.meters ?? 0
  return {
    rank: mine > 0 ? ranked.filter((t) => t.meters > mine).length + 1 : null,
    runners: ranked.length,
    distanceMeters: mine,
  }
}

async function monthlyTotals(clubId?: string) {
  const rows = await prisma.activity.groupBy({
    by: ["userId"],
    where: {
      countsForLeaderboard: true,
      activityDate: { gte: startOfMonthUtc() },
      ...(clubId ? { clubId } : {}),
    },
    _sum: { distanceMeters: true },
  })
  return rows.map((r) => ({ userId: r.userId, meters: r._sum.distanceMeters ?? 0 }))
}

export async function getRankingSummary(
  userId: string,
  clubId: string | null
): Promise<RankingSummary> {
  if (!clubId) {
    return { ...EMPTY_RANKING, globalMonthly: rankPosition(await monthlyTotals(), userId) }
  }
  // Only counting runs carry a clubId, so these are plain sums by club.
  const [global, club, mine, clubTotal] = await Promise.all([
    monthlyTotals(),
    monthlyTotals(clubId),
    prisma.activity.aggregate({ where: { userId, clubId }, _sum: { distanceMeters: true } }),
    prisma.activity.aggregate({ where: { clubId }, _sum: { distanceMeters: true } }),
  ])
  const contributionMeters = mine._sum.distanceMeters ?? 0
  const clubMeters = clubTotal._sum.distanceMeters ?? 0
  return {
    globalMonthly: rankPosition(global, userId),
    clubMonthly: rankPosition(club, userId),
    contributionMeters,
    productivityPct: clubMeters > 0 ? (contributionMeters / clubMeters) * 100 : 0,
  }
}

/** Días consecutivos (incluyendo hoy o ayer) con al menos una actividad. */
function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const days = new Set(
    dates.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
  )
  const oneDay = 86_400_000
  const today = new Date()
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  // Permite arrancar la racha desde ayer si aún no se corrió hoy.
  if (!days.has(cursor)) cursor -= oneDay
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor -= oneDay
  }
  return streak
}
