"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function WaitlistPage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, name }),
      });

      if (res.status === 201)  { trackEvent.joinWaitlist("waitlist_page"); setStatus("success");   return; }
      if (res.status === 409)  { setStatus("duplicate"); return; }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-lg w-full mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>🏃</span>
            <span>Early Access</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Join the Waitlist
          </h1>
          <p className="text-lg text-muted mb-10">
            Be the first to know when w3runn3rs launches.
            Pick your running club, make it count.
          </p>

          {/* ── Success state ── */}
          {status === "success" ? (
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">
                You&apos;re in!
              </h2>
              <p className="text-muted">
                We&apos;ll reach out as soon as w3runn3rs is ready to launch.
                Start warming up.
              </p>
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
              {status === "duplicate" && (
                <p className="mt-4 text-sm text-brand-green">
                  ✓ This email is already on the waitlist. See you at launch!
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              <p className="text-muted text-sm mt-4">No spam. Unsubscribe anytime.</p>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
