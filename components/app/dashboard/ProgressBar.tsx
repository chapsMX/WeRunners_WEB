import { cn } from "@/lib/utils"

export function ProgressBar({
  value,
  className,
  trackClassName,
}: {
  /** 0–100 */
  value: number
  className?: string
  trackClassName?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line/40", trackClassName)}
    >
      <div
        className={cn("h-full rounded-full bg-brand-green transition-all", className)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
