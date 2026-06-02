"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

const STEPS = [
  { step: 1, title: "Register your club",  description: "Fill out the form with your club details — name, city, logo and social media." },
  { step: 2, title: "Verification",        description: "Your club info is reviewed by our team. Once approved, you get your own dashboard." },
  { step: 3, title: "Invite your runners", description: "Share your club link. Your runners join, sync their wearables and start logging km." },
  { step: 4, title: "Start competing",     description: "Weekly and monthly leaderboards, powered by real data from every run." },
];

export default function ForClubsPage() {
  const [clubName, setClubName]   = useState("");
  const [city, setCity]           = useState("");
  const [email, setEmail]         = useState("");
  const [runners, setRunners]     = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter]     = useState("");
  const [tiktok, setTiktok]       = useState("");
  const [facebook, setFacebook]   = useState("");
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [status, setStatus]       = useState<Status>("idle");
  const fileInputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem("w3_club_registered") === "1") {
      setStatus("success");
    }
  }, []);

  useEffect(() => {
    return () => { if (logoPreview) URL.revokeObjectURL(logoPreview); };
  }, [logoPreview]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const form = new FormData();
      form.append("clubName",  clubName);
      form.append("city",      city);
      form.append("email",     email);
      form.append("runners",   runners);
      form.append("instagram", instagram);
      form.append("twitter",   twitter);
      form.append("tiktok",    tiktok);
      form.append("facebook",  facebook);
      if (logoFile) form.append("logo", logoFile);

      const res = await fetch("/api/clubs", { method: "POST", body: form });

      if (res.status === 201) {
        localStorage.setItem("w3_club_registered", "1");
        trackEvent.registerClub("for_clubs");
        setStatus("success");
        return;
      }
      if (res.status === 409) {
        localStorage.setItem("w3_club_registered", "1");
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

      {/* ── Section 1: Hero + Steps ── */}
      <section className="bg-background pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Does your running club{" "}
              <span className="text-brand-green">need a home?</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Registering your club on w3runn3rs is free and takes just a few
              minutes. Once you&apos;re in, your club joins the global leaderboard.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-30" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map(({ step, title, description }) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center mb-6 relative z-10">
                    <span className="text-brand-green font-extrabold text-xl">{step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 2: Form (with background image) ── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <Image
          src="/images/fondoClubes.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />

        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-8 text-center">
            Register Your Club
          </h2>

          {/* ── Success / duplicate state ── */}
          {status === "success" || status === "duplicate" ? (
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-4">🏃</p>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                {status === "duplicate" ? "Already registered!" : "Submission received!"}
              </h3>
              <p className="text-white/70 mb-8">
                {status === "duplicate"
                  ? "This club is already on our list. We'll reach out to you soon."
                  : <>Your club registration is <strong className="text-white">pending approval</strong>. We&apos;ll review it and reach out to you soon. Check your inbox for a confirmation email.</>
                }
              </p>
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
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Club name *"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <Input
                type="text"
                placeholder="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <Input
                type="email"
                placeholder="Contact email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <Input
                type="number"
                placeholder="Approximate number of runners"
                value={runners}
                onChange={(e) => setRunners(e.target.value)}
                min="1"
                disabled={status === "loading"}
              />

              {/* ── Social Media ── */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-white mb-3">
                  Social Media <span className="text-white/50 font-normal">(optional)</span>
                </p>
                <div className="flex flex-col gap-3">
                  <Input
                    type="text"
                    placeholder="Instagram  @handle"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    disabled={status === "loading"}
                  />
                  <Input
                    type="text"
                    placeholder="Twitter / X  @handle"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    disabled={status === "loading"}
                  />
                  <Input
                    type="text"
                    placeholder="TikTok  @handle"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    disabled={status === "loading"}
                  />
                  <Input
                    type="text"
                    placeholder="Facebook  @handle"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              {/* ── Logo upload ── */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={status === "loading"}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === "loading"}
                  className="w-full rounded-lg border border-dashed border-white/20 hover:border-brand-green
                             bg-white/5 transition-colors duration-200 px-4 py-6
                             flex flex-col items-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      className="rounded-lg object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth={1.5} className="w-8 h-8 text-white/40">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21
                           18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  )}
                  <span className="text-sm text-white/60">
                    {logoFile ? logoFile.name : "Upload your club logo"}
                  </span>
                  {logoFile ? (
                    <span className="text-xs text-brand-green">✓ Ready to upload</span>
                  ) : (
                    <span className="text-xs text-white/30">
                      Recommended size: 1,000 × 1,000 px · JPG or PNG
                    </span>
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="text-white w-full mt-2"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Registering…" : "Register Your Club — It's Free →"}
              </Button>

              {status === "error" && (
                <p className="text-sm text-red-400 text-center">
                  Something went wrong. Please try again.
                </p>
              )}

              <p className="text-white/40 text-sm text-center">
                Free forever. No credit card required.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
