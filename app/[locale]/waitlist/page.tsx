"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { XIcon, InstagramIcon, FarcasterIcon } from "@/components/ui/SocialIcons";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type Club = { id: string; clubName: string; city: string };

export default function WaitlistPage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [clubId, setClubId]   = useState("");
  const [clubs, setClubs]     = useState<Club[]>([]);
  const [status, setStatus]   = useState<Status>("idle");
  const [igCopied, setIgCopied] = useState(false);

  const SHARE_TEXT = "I just joined the w3runn3rs waitlist — the global hub for running clubs. Pick your running club, make it count! 🏃 www.w3runn3rs.com";
  const SHARE_URL  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}`;
  const CAST_URL   = `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_TEXT)}`;

  function copyForInstagram() {
    navigator.clipboard.writeText(SHARE_TEXT);
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 3000);
  }

  // On mount: check if user already joined + fetch enabled clubs
  useEffect(() => {
    if (localStorage.getItem("w3_waitlist_joined") === "1") {
      setStatus("success");
    }
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((data: Club[]) => setClubs(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, name, clubId: clubId || undefined }),
      });

      if (res.status === 201)  {
        localStorage.setItem("w3_waitlist_joined", "1");
        trackEvent.joinWaitlist("waitlist_page");
        setStatus("success");
        return;
      }
      if (res.status === 409)  {
        localStorage.setItem("w3_waitlist_joined", "1"); // ya estaba registrado, igual mostramos confirmación
        setStatus("duplicate");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Header />
      <main className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Hero background — mismo efecto que home */}
        <Image
          src="/images/fondoWaitlist.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />

        <div className="relative z-10 max-w-lg w-full mx-auto text-center">

          {/* Badge + headline — hidden once confirmed */}
          {status !== "success" && status !== "duplicate" && (
            <>
              <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green text-sm font-medium px-4 py-2 rounded-full mb-8">
                <span>🏃</span>
                <span>Early Access</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Join the Waitlist
              </h1>
              <p className="text-lg text-white/70 mb-10">
                Be the first to know when w3runn3rs launches.
                Pick your running club, make it count.
              </p>
            </>
          )}

          {/* ── Success / Duplicate state ── */}
          {(status === "success" || status === "duplicate") ? (
            <div className="bg-white/5 border border-brand-green/30 rounded-2xl p-8 text-center backdrop-blur-sm">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">
                You&apos;re on the list!
              </h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                We&apos;ll notify you when w3runn3rs launches. Follow us for
                updates and spread the word — share to your socials.
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

              {/* Divider */}
              <div className="border-t border-white/10 mb-6" />

              {/* Share buttons */}
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                Spread the word
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={SHARE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/20
                             bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-3
                             transition-colors"
                >
                  <XIcon size={16} />
                  Share on X
                </a>

                <button
                  type="button"
                  onClick={copyForInstagram}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/20
                             bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-3
                             transition-colors cursor-pointer"
                >
                  <InstagramIcon size={16} />
                  {igCopied ? "Copied! Open Instagram ✓" : "Share on Instagram"}
                </button>

                <a
                  href={CAST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/20
                             bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-3
                             transition-colors"
                >
                  <FarcasterIcon size={16} />
                  Share on Farcaster
                </a>
              </div>

              {/* Back to home */}
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-brand-green font-semibold hover:underline"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                  </svg>
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "loading"}
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />

                {/* ── Club selector ── */}
                <div>
                  <p className="text-white/60 text-sm mb-2">
                    Already know your club? Pick it now.
                  </p>
                  {clubs.length === 0 ? (
                    <p className="text-sm text-white/40 italic px-1">
                      No clubs available yet — check back soon.
                    </p>
                  ) : (
                    <select
                      value={clubId}
                      onChange={(e) => setClubId(e.target.value)}
                      disabled={status === "loading"}
                      className="w-full rounded-lg border border-line bg-surface-alt text-foreground
                                 px-4 py-3 text-sm focus:outline-none focus:border-brand-green
                                 disabled:opacity-50"
                    >
                      <option value="">— Select your club (optional) —</option>
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.clubName} · {c.city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="text-white w-full"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Joining…" : "Join the Waitlist →"}
                </Button>
              </form>

              {/* ── Inline feedback ── */}
              {status === "error" && (
                <p className="mt-4 text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              <p className="text-white/50 text-sm mt-4">No spam. Unsubscribe anytime.</p>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
