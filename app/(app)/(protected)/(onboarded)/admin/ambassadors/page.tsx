import Link from "next/link"
import { getAppTranslator } from "@/lib/app-i18n"
import { countryName } from "@/lib/countries"
import { listAmbassadorApplications, type AdminAmbassadorRow } from "@/lib/ambassador-applications"
import { AdminStatStrip } from "@/components/app/admin/AdminStatStrip"
import { AmbassadorStatusButtons } from "@/components/app/admin/AmbassadorStatusButtons"

const SOCIAL = {
  instagram: (h: string) => `https://instagram.com/${encodeURIComponent(h)}`,
  twitter: (h: string) => `https://x.com/${encodeURIComponent(h)}`,
  tiktok: (h: string) => `https://www.tiktok.com/@${encodeURIComponent(h)}`,
} as const

// Superadmin › Ambassadors: applications with the runner and club they're linked to.
export default async function AdminAmbassadorsPage() {
  const { t, locale } = await getAppTranslator("clubAdmin.ambassadors")
  const rows = await listAmbassadorApplications()
  const count = (s: AdminAmbassadorRow["status"]) => rows.filter((r) => r.status === s).length
  const date = (d: Date) => d.toLocaleDateString(locale, { dateStyle: "medium" })

  return (
    <div className="space-y-8">
      <AdminStatStrip
        items={[
          { label: t("total"), value: rows.length },
          { label: t("statusName.pending"), value: count("pending") },
          { label: t("statusName.shortlisted"), value: count("shortlisted") },
          { label: t("statusName.rejected"), value: count("rejected") },
        ]}
      />

      {rows.length === 0 ? (
        <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {rows.map((r) => {
            const socials = (["instagram", "twitter", "tiktok"] as const).filter((k) => r[k])
            return (
              <li key={r.id} className="space-y-3 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {r.user?.username ? (
                        <Link href={`/u/${r.user.username}`} className="hover:text-brand-green">
                          {r.user.name} <span className="font-normal text-muted">@{r.user.username}</span>
                        </Link>
                      ) : (
                        r.user?.name ?? r.fullName ?? r.email
                      )}
                      <span
                        className={`ml-2 border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                          r.status === "shortlisted"
                            ? "border-brand-green/60 text-brand-green"
                            : r.status === "rejected"
                              ? "border-line text-muted"
                              : "border-yellow-300/60 text-yellow-300"
                        }`}
                      >
                        {t(`statusName.${r.status}`)}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {r.club ? (
                        r.club.slug ? (
                          <Link href={`/clubs/${r.club.slug}`} className="hover:text-brand-green">
                            {r.club.name}
                          </Link>
                        ) : (
                          <>
                            {r.club.name} <span className="text-yellow-300">({t("clubPending")})</span>
                          </>
                        )
                      ) : (
                        <span>{r.user ? t("noClub") : t("legacy")}</span>
                      )}
                      {r.country && <> · {r.country === "other" ? t("otherCountry") : countryName(r.country, locale)}</>}
                      {r.email && <> · {r.email}</>} · {t("applied", { date: date(r.createdAt) })}
                    </p>
                    {socials.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-3 text-xs">
                        {socials.map((k) => (
                          <a key={k} href={SOCIAL[k](r[k]!)} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                            {k === "twitter" ? "X" : k === "instagram" ? "Instagram" : "TikTok"} @{r[k]}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                  <AmbassadorStatusButtons id={r.id} status={r.status} />
                </div>
                <p className="whitespace-pre-line border-l-2 border-line pl-3 text-sm text-foreground/90">{r.motivation}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
