// Helpers de formato para el dashboard (km, ritmo, duración, fechas).
// El usuario tiene preferredUnit (KM | MILES) en User — por ahora asumimos KM.

const METERS_PER_KM = 1000

export function formatKm(meters: number, opts: { decimals?: number } = {}): string {
  const { decimals = 1 } = opts
  const km = meters / METERS_PER_KM
  return km.toFixed(decimals)
}

/** "8.4 km" */
export function formatDistance(meters: number, decimals = 1): string {
  return `${formatKm(meters, { decimals })} km`
}

/** segundos por km → "5:12 /km" */
export function formatPace(secPerKm: number | null | undefined): string {
  if (!secPerKm || secPerKm <= 0) return "—"
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, "0")} /km`
}

/** segundos → "1h 24m" o "42m 10s" */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

/** Diferencia en días naturales entre `date` y `now` (positivo = en el pasado). */
export function daysSince(date: Date, now = new Date()): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000)
}

/** Fecha corta locale-aware: "12 Jun" / "Jun 12". */
export function formatShortDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" })
}

/** Lunes 00:00 de la semana de `now` (semana ISO, arranca lunes). */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = (d.getDay() + 6) % 7 // 0 = lunes
  d.setDate(d.getDate() - day)
  return d
}

/** Primer día del mes de `now`. */
export function startOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}
