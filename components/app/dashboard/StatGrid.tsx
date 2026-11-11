import type { StatIcon } from "./StatCard"

export type StatGridCard = {
  title: string
  value: string
  sub: string
  icon: StatIcon
}

/**
 * Grid 2×2 de estadísticas con el estilo de la sección "Does your running club…"
 * del home: divisores de 1px (`gap-px` + `bg-line`), celdas centradas y hover azul.
 * Compartido por "Your ranking" (RankGrid) y "Your numbers" (PersonalStats).
 */
export function StatGrid({ cards }: { cards: StatGridCard[] }) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-px border border-line bg-line">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.title}
            className="group flex flex-col items-center justify-center gap-3 bg-surface-alt p-6 text-center transition-colors duration-300 hover:bg-brand-blue"
          >
            <Icon size={36} className="text-brand-green" />
            <h4 className="font-bold uppercase tracking-wide text-white">{c.title}</h4>
            <p className="text-3xl font-extrabold leading-none text-white">{c.value}</p>
            <p className="text-sm text-muted transition-colors group-hover:text-white/80">
              {c.sub}
            </p>
          </div>
        )
      })}
    </div>
  )
}
