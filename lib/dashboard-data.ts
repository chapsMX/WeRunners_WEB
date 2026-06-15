import { prisma } from "@/lib/prisma"
import { startOfMonth, startOfWeek } from "@/lib/format"

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

export type DashboardData = {
  /** true cuando se muestran datos de demostración (el usuario aún no tiene actividades). */
  isSample: boolean
  deviceConnected: boolean
  club: ClubSummary | null
  contribution: ContributionSummary
  personal: PersonalSummary
  recent: ActivityRow[]
}

// ─────────────────────────────────────────────────────────────
// Dataset de muestra — se usa cuando el usuario aún no registró
// actividades, para que el diseño del dashboard se vea completo.
// Marcado con isSample: true para mostrar el badge "Datos de muestra".
// ─────────────────────────────────────────────────────────────

function sampleData(): DashboardData {
  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000)
  return {
    isSample: true,
    deviceConnected: false,
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
        select: { connectedDevice: true },
      }),
      prisma.clubMembership.findFirst({
        where: { userId, isActive: true },
        include: { club: true },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { activityDate: "desc" },
        take: 6,
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

  // Sin actividades todavía → mostramos el dataset de muestra.
  if (recentActivities.length === 0) {
    return sampleData()
  }

  const deviceConnected = Boolean(user?.connectedDevice)

  // ── Aporte al club (semana en curso) ──
  const weekDistance = weekAgg._sum.distanceMeters ?? 0
  const weekCount = weekAgg._count ?? 0

  let club: ClubSummary | null = null
  let contribution: ContributionSummary = {
    distanceMeters: weekDistance,
    activities: weekCount,
    rankInClub: null,
    totalContributors: 0,
    sharePct: 0,
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
    records: prRecords
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

  return { isSample: false, deviceConnected, club, contribution, personal, recent }
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
