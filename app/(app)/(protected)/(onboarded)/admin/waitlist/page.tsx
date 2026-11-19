import Link from "next/link"
import { getAppTranslator } from "@/lib/app-i18n"
import { getWaitlistOverview, type WaitlistRow } from "@/lib/admin-data"
import { GrantBetaButton } from "@/components/app/clubs/ApproveRegistrationButton"
import { AdminStatStrip } from "@/components/app/admin/AdminStatStrip"

// Superadmin › Waitlist: everyone on the list, who has access, who signed up.
export default async function AdminWaitlistPage() {
  const { t, locale } = await getAppTranslator("clubAdmin.waitlist")
  const { rows, totals } = await getWaitlistOverview()
  const pending = rows.filter((r) => !r.beta)
  const granted = rows.filter((r) => r.beta).reverse()
  const date = (d: Date) => d.toLocaleDateString(locale, { dateStyle: "medium" })

  const status = (r: WaitlistRow) =>
    !r.account
      ? t("status.noAccount")
      : !r.account.onboarded
        ? t("status.onboarding")
        : r.account.clubName
          ? t("status.inClub", { club: r.account.clubName })
          : t("status.noClub")

  const row = (r: WaitlistRow, action: boolean) => (
    <li key={r.email} className="flex flex-wrap items-center gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">
          {r.name || r.email}
          {r.account?.username && (
            <Link href={`/u/${r.account.username}`} className="ml-2 text-xs font-normal text-muted hover:text-brand-green">
              @{r.account.username}
            </Link>
          )}
        </p>
        <p className="truncate text-xs text-muted">
          {r.name ? `${r.email} · ` : ""}
          {t("joined", { date: date(r.createdAt) })} · {status(r)}
          {r.inviteClubName && <span className="text-brand-green"> · {t("viaInvite", { club: r.inviteClubName })}</span>}
        </p>
      </div>
      {action && <GrantBetaButton email={r.email} />}
    </li>
  )

  return (
    <div className="space-y-10">
      <AdminStatStrip
        items={[
          { label: t("total"), value: totals.total },
          { label: t("withAccess"), value: totals.withAccess },
          { label: t("withAccount"), value: totals.withAccount },
          { label: t("onboarded"), value: totals.onboarded },
        ]}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("pendingTitle", { count: pending.length })}</h2>
        {pending.length === 0 ? (
          <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("pendingEmpty")}</p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface-alt/40">{pending.map((r) => row(r, true))}</ul>
        )}
        <p className="mt-2 text-xs text-muted">{t("hint")}</p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("grantedTitle", { count: granted.length })}</h2>
        {granted.length === 0 ? (
          <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("grantedEmpty")}</p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface-alt/40">{granted.map((r) => row(r, false))}</ul>
        )}
      </section>
    </div>
  )
}
