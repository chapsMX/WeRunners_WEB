"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { memberAction, type MemberOp } from "@/app/(app)/(protected)/(onboarded)/clubs/[slug]/manage/actions"

export type ClubMemberRow = {
  id: string
  name: string
  username: string | null
  image: string | null
  joinedAt: string
  isOwner: boolean
  isCollaborator: boolean
  isViewer: boolean
}

/** Members with role badges and the actions the viewer is allowed to take. */
export function ClubMembers({
  clubId,
  members,
  canAdminister,
  viewerIsOwner,
  superadmin,
}: {
  clubId: string
  members: ClubMemberRow[]
  canAdminister: boolean
  viewerIsOwner: boolean
  superadmin: boolean
}) {
  const t = useTranslations("clubAdmin")
  const [pending, start] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run(member: ClubMemberRow, op: MemberOp, confirmKey?: string) {
    if (confirmKey && !window.confirm(t(confirmKey, { name: member.name }))) return
    setError(null)
    setBusyId(member.id)
    start(async () => {
      const result = await memberAction(clubId, member.id, op)
      if (!result.ok) setError(t(`form.errors.${result.error}`))
      setBusyId(null)
    })
  }

  const btn =
    "border border-line px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green disabled:opacity-50"
  const danger =
    "border border-line px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"

  if (members.length === 0) {
    return (
      <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">
        {t("membersEmpty")}
      </p>
    )
  }

  return (
    <>
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <ul className="divide-y divide-line border border-line bg-surface-alt/40">
        {members.map((m) => {
          const busy = pending && busyId === m.id
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                {m.image ? (
                  <Image src={m.image} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-bold text-brand-green">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                  {m.username ? (
                    <Link href={`/u/${m.username}`} className="truncate hover:text-brand-green">
                      {m.name}
                    </Link>
                  ) : (
                    <span className="truncate">{m.name}</span>
                  )}
                  {m.isOwner && (
                    <span className="border border-brand-green/50 bg-brand-green/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brand-green">
                      {t("roles.owner")}
                    </span>
                  )}
                  {m.isCollaborator && !m.isOwner && (
                    <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {t("roles.collaborator")}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted">
                  {m.username ? `@${m.username} · ` : ""}
                  {t("joined", { date: m.joinedAt })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canAdminister && !m.isOwner && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(m, m.isCollaborator ? "collaborator_off" : "collaborator_on")}
                      className={btn}
                    >
                      {m.isCollaborator ? t("actions.removeCollaborator") : t("actions.makeCollaborator")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(m, "make_owner", viewerIsOwner ? "confirm.transfer" : "confirm.makeOwner")
                      }
                      className={btn}
                    >
                      {viewerIsOwner ? t("actions.transfer") : t("actions.makeOwner")}
                    </button>
                    {!m.isViewer && (
                      <button type="button" disabled={busy} onClick={() => run(m, "remove", "confirm.remove")} className={danger}>
                        {t("actions.remove")}
                      </button>
                    )}
                  </>
                )}
                {superadmin && m.isOwner && (
                  <button type="button" disabled={busy} onClick={() => run(m, "clear_owner", "confirm.clearOwner")} className={danger}>
                    {t("actions.clearOwner")}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
