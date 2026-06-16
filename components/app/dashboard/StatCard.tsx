import type { ComponentType } from "react"

export type StatIcon = ComponentType<{ size?: number; className?: string }>

/** Card de estadística compartida (hero + "Tus números") para un formato idéntico. */
export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string
  value: string
  sub: string
  icon: StatIcon
}) {
  return (
    <div className="border border-line bg-surface-alt p-4 shadow-lg lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-green/10 text-brand-green">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold leading-none text-foreground lg:text-4xl">{value}</p>
      <p className="mt-3 text-sm text-muted">{sub}</p>
    </div>
  )
}
