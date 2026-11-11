"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { XIcon, InstagramIcon, FarcasterIcon } from "@/components/ui/SocialIcons";

// "You're on the list!" card — shared by the landing waitlist success state
// and the app waiting room (/auth/waiting) so both stay identical.

const SHARE_TEXT =
  "I just joined the w3runn3rs waitlist — the global hub for running clubs. Pick your running club, make it count! 🏃 www.w3runn3rs.com";
const SHARE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}`;
const CAST_URL = `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_TEXT)}`;

const shareBtn =
  "flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-3 transition-colors";

export type OnTheListAccount = {
  email: string;
  name?: string | null;
  image?: string | null;
};

export function OnTheListCard({
  account,
  backLink,
  footer,
}: {
  /** Signed-in account (app waiting room): shows avatar, name and email. */
  account?: OnTheListAccount;
  /** Page-specific "back" link (landing → "/", app → www.w3runn3rs.com). */
  backLink: ReactNode;
  /** Extra actions under the back link (e.g. Sign out in the app). */
  footer?: ReactNode;
}) {
  const [igCopied, setIgCopied] = useState(false);

  function copyForInstagram() {
    navigator.clipboard.writeText(SHARE_TEXT);
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 3000);
  }

  const displayName = account?.name?.trim() || account?.email.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase() || "R";

  return (
    <div className="bg-white/5 border border-brand-green/30 rounded-2xl p-8 text-center backdrop-blur-sm">
      {account ? (
        <div className="flex flex-col items-center mb-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white/10 ring-2 ring-brand-green/40">
            {account.image ? (
              <Image src={account.image} alt={displayName} fill sizes="80px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-green">
                {initial}
              </span>
            )}
          </div>
          {account.name && <p className="mt-3 font-semibold text-white">{account.name}</p>}
          <p className="text-sm text-white/60">{account.email}</p>
        </div>
      ) : (
        <p className="text-5xl mb-4">🎉</p>
      )}

      <h2 className="text-3xl font-extrabold text-white mb-3">You&apos;re on the list!</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        We&apos;ll notify you when w3runn3rs launches. Follow us for updates and spread the word —
        share to your socials.
      </p>

      {/* Follow links */}
      <div className="flex items-center justify-center gap-5 mb-8">
        <a href="https://x.com/w3runn3rs" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="text-white/60 hover:text-brand-lime transition-colors">
          <XIcon size={22} />
        </a>
        <a href="https://www.instagram.com/w3runn3rs" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-brand-lime transition-colors">
          <InstagramIcon size={22} />
        </a>
        <a href="https://farcaster.xyz/w3runn3rs" target="_blank" rel="noopener noreferrer" aria-label="Farcaster" className="text-white/60 hover:text-brand-lime transition-colors">
          <FarcasterIcon size={22} />
        </a>
      </div>

      <div className="border-t border-white/10 mb-6" />

      {/* Share buttons */}
      <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Spread the word</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href={SHARE_URL} target="_blank" rel="noopener noreferrer" className={shareBtn}>
          <XIcon size={16} />
          Share on X
        </a>
        <button type="button" onClick={copyForInstagram} className={`${shareBtn} cursor-pointer`}>
          <InstagramIcon size={16} />
          {igCopied ? "Copied! Open Instagram ✓" : "Share on Instagram"}
        </button>
        <a href={CAST_URL} target="_blank" rel="noopener noreferrer" className={shareBtn}>
          <FarcasterIcon size={16} />
          Share on Farcaster
        </a>
      </div>

      <div className="mt-6">{backLink}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

/** Arrow used by the back links on both pages. */
export function BackArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
