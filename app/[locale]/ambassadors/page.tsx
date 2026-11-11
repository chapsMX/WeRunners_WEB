"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics";
import { AMBASSADOR_COUNTRIES, AMBASSADOR_LIMITS } from "@/lib/ambassadors";

type Status = "idle" | "loading" | "success" | "error";

export default function AmbassadorsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/ambassadors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        trackEvent.ambassadorApply(); // only once the application is saved
        setStatus("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
              Run with us.{" "}
              <span className="text-brand-lime">Lead the pack.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We&apos;re looking for passionate runners with a voice. People who
              live and breathe running culture and want to be part of building
              something global from the ground up.
            </p>
          </div>

          {/* Body */}
          <div className="prose prose-invert prose-lime max-w-none mb-16">
            <blockquote className="border-l-4 border-brand-lime pl-6 text-slate-300 not-italic">
              The w3runn3rs Ambassador Program is built for runners who inspire
              others — on the road and online. If you have an engaged community,
              a passion for running and the drive to help grow the world&apos;s
              most committed running hub, we want to hear from you.
            </blockquote>
          </div>

          {/* Who / What grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Who we're looking for */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Who we&apos;re looking for
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: "🏃",
                    title: "Passionate runners",
                    description: "You run, you race, you live the culture.",
                  },
                  {
                    icon: "📱",
                    title: "Active on social media",
                    description:
                      "Strong presence on Instagram and/or Twitter with an engaged running audience.",
                  },
                  {
                    icon: "🌍",
                    title: "Community builders",
                    description:
                      "You bring people together and inspire them to move.",
                  },
                ].map(({ icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{title}</h3>
                      <p className="text-slate-400 text-sm">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What we offer */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                What we offer
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: "🚀",
                    title: "Early Access",
                    description:
                      "Be the first to access the platform before anyone else.",
                  },
                  {
                    icon: "👕",
                    title: "Exclusive Merch",
                    description:
                      "Official w3runn3rs gear — before it's available to the public.",
                  },
                  {
                    icon: "🎁",
                    title: "More Perks",
                    description:
                      "Economic compensation and more. Details shared with selected ambassadors.",
                  },
                ].map(({ icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{title}</h3>
                      <p className="text-slate-400 text-sm">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Apply to become an Ambassador
            </h2>
            {status === "success" ? (
              <div role="status" className="rounded-lg border border-brand-lime/40 bg-brand-lime/10 p-8 text-center">
                <p className="text-4xl mb-3">🏃</p>
                <h3 className="text-2xl font-bold text-foreground mb-2">Application received</h3>
                <p className="text-slate-400">
                  Thanks for applying! We&apos;ve sent a confirmation to your email. If
                  you&apos;re shortlisted, we&apos;ll reach out to you there.
                </p>
              </div>
            ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amb-name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full name *
                  </label>
                  <Input
                    id="amb-name"
                    name="fullName"
                    type="text"
                    placeholder="Jane Runner"
                    autoComplete="name"
                    maxLength={AMBASSADOR_LIMITS.nameMax}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amb-email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <Input
                    id="amb-email"
                    name="email"
                    type="email"
                    placeholder="jane@runnerclub.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amb-country" className="block text-sm font-medium text-slate-300 mb-2">
                  Country *
                </label>
                <select
                  id="amb-country"
                  name="country"
                  defaultValue=""
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-lime"
                  required
                >
                  <option value="" disabled>Select your country</option>
                  {AMBASSADOR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="amb-ig" className="block text-sm font-medium text-slate-300 mb-2">
                    Instagram
                  </label>
                  <Input id="amb-ig" name="instagram" type="text" placeholder="@handle" />
                </div>
                <div>
                  <label htmlFor="amb-x" className="block text-sm font-medium text-slate-300 mb-2">
                    Twitter/X
                  </label>
                  <Input id="amb-x" name="twitter" type="text" placeholder="@handle" />
                </div>
                <div>
                  <label htmlFor="amb-tiktok" className="block text-sm font-medium text-slate-300 mb-2">
                    TikTok
                  </label>
                  <Input id="amb-tiktok" name="tiktok" type="text" placeholder="@handle" />
                </div>
              </div>

              <div>
                <label htmlFor="amb-why" className="block text-sm font-medium text-slate-300 mb-2">
                  Why do you want to be a w3runn3rs ambassador? *
                </label>
                <textarea
                  id="amb-why"
                  name="motivation"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 text-foreground px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-lime"
                  placeholder="Tell us about yourself and why you'd be a great ambassador..."
                  minLength={AMBASSADOR_LIMITS.motivationMin}
                  maxLength={AMBASSADOR_LIMITS.motivationMax}
                  required
                />
              </div>

              <p className="text-slate-500 text-sm italic">
                You don&apos;t need to be active on all platforms — just the
                ones where you genuinely connect with your running community.
              </p>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending…" : "Apply to become an Ambassador →"}
              </Button>

              <p className="text-slate-500 text-sm text-center">
                Applications are reviewed on a rolling basis. Only shortlisted
                candidates will be contacted.
              </p>
            </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
