"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OnTheListCard, BackArrow } from "@/components/waitlist/OnTheListCard";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type Club = { id: string; clubName: string; city: string };

export default function WaitlistPage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [clubId, setClubId]   = useState("");
  const [clubs, setClubs]     = useState<Club[]>([]);
  const [status, setStatus]   = useState<Status>("idle");

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
            <OnTheListCard
              backLink={
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-brand-green font-semibold hover:underline"
                >
                  <BackArrow />
                  Back to home
                </Link>
              }
            />
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
                  <label
                    htmlFor="club-select"
                    className="block text-white/60 text-sm mb-2"
                  >
                    Already know your club? Pick it now.
                  </label>
                  {clubs.length === 0 ? (
                    <p className="text-sm text-white/40 italic px-1">
                      No clubs available yet — check back soon.
                    </p>
                  ) : (
                    <select
                      id="club-select"
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
