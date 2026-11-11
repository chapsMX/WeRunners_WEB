"use client"

import { cn } from "@/lib/utils"

/** Toggle segmentado (2 opciones) usado en onboarding y edición de perfil. */
export function SegToggle<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
            value === o.value
              ? "border-brand-green bg-brand-green/10 text-brand-green"
              : "border-line text-muted hover:border-brand-green/50 hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

/**
 * Input de red social con prefijo fijo visible (p. ej. `@` o `facebook.com/`).
 * El usuario sólo escribe su segmento; se envía `prefix + segmento` cuando hay
 * texto, o vacío cuando no, vía un input oculto con el `name` real.
 */
export function SocialInput({
  id,
  name,
  prefix,
  value,
  onChange,
  placeholder,
  error,
  errorText,
}: {
  id: string
  name: string
  prefix: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  error?: boolean
  errorText?: string
}) {
  const trimmed = value.trim()
  const submitValue = trimmed ? prefix + trimmed : ""
  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl border bg-surface-alt/40 px-3 transition-colors focus-within:border-brand-green",
          error ? "border-red-500/60" : "border-line"
        )}
      >
        <span className="shrink-0 text-sm text-muted">{prefix}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none"
        />
        <input type="hidden" name={name} value={submitValue} />
      </div>
      {error && errorText && <p className="mt-1.5 text-xs text-red-400">{errorText}</p>}
    </div>
  )
}
