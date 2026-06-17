// Validación y normalización compartida entre el onboarding y la edición de
// perfil (/settings). Mantener una sola fuente de verdad para username y redes.

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/

// Rutas/identificadores que no pueden usarse como username público.
export const RESERVED = new Set([
  "admin", "api", "auth", "dashboard", "settings", "profile", "clubs",
  "club", "leaderboard", "onboarding", "w3runn3rs", "runners", "support",
  "about", "help", "me", "new", "edit",
])

/** Devuelve el código de error i18n ("invalid" | "reserved") o null si es válido. */
export function validateUsername(raw: string): "invalid" | "reserved" | null {
  if (!USERNAME_RE.test(raw)) return "invalid"
  if (RESERVED.has(raw)) return "reserved"
  return null
}

/**
 * Normaliza un @handle de red social. Acepta que el usuario pegue el handle
 * con o sin `@`, o incluso una URL completa del perfil. Devuelve el handle
 * limpio o null si quedó vacío.
 */
export function cleanHandle(raw: string): string | null {
  let v = raw.trim()
  if (!v) return null
  // Si pegaron una URL de perfil, quédate sólo con el último segmento.
  v = v.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com|instagram\.com)\//i, "")
  v = v.replace(/^@/, "").replace(/\/.*$/, "").trim()
  v = v.replace(/[^a-zA-Z0-9_.]/g, "")
  return v.length ? v.slice(0, 30) : null
}

/**
 * Normaliza y valida una URL de perfil. Agrega `https://` si falta el esquema.
 * Devuelve { url } con la URL normalizada, { url: null } si venía vacía, o
 * { invalid: true } si no es parseable.
 */
export function cleanUrl(raw: string): { url: string | null; invalid?: boolean } {
  const trimmed = raw.trim()
  if (!trimmed) return { url: null }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withScheme)
    if (!u.hostname.includes(".")) return { url: null, invalid: true }
    return { url: u.toString() }
  } catch {
    return { url: null, invalid: true }
  }
}
