/** Row of headline numbers for an admin tab. */
export function AdminStatStrip({ items }: { items: { label: string; value: number | string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="flex flex-col items-center gap-1 bg-surface-alt p-5 text-center">
          <span className="text-2xl font-extrabold text-white">{i.value}</span>
          <span className="text-xs uppercase tracking-wide text-muted">{i.label}</span>
        </div>
      ))}
    </div>
  )
}
