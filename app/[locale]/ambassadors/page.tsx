import type { ComponentType } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ActivityIcon,
  ClubIcon,
  GiftIcon,
  MegaphoneIcon,
  RocketIcon,
  ShirtIcon,
} from "@/components/app/icons";

// Applications live in the app now (club required): sign in, then /ambassadors/apply.
const APPLY_URL = "https://app.w3runn3rs.com/auth/sign-in?callbackUrl=%2Fambassadors%2Fapply";

type Props = { params: Promise<{ locale: string }> };
type Icon = ComponentType<{ size?: number; className?: string }>;

function Feature({ icon: Icon, title, description }: { icon: Icon; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-brand-green/40 bg-brand-green/10 text-brand-green">
        <Icon size={22} />
      </span>
      <div>
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

export default async function AmbassadorsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ambassadors" });

  const who: { icon: Icon; key: "runners" | "social" | "community" }[] = [
    { icon: ActivityIcon, key: "runners" },
    { icon: MegaphoneIcon, key: "social" },
    { icon: ClubIcon, key: "community" },
  ];
  const offer: { icon: Icon; key: "early" | "merch" | "perks" }[] = [
    { icon: RocketIcon, key: "early" },
    { icon: ShirtIcon, key: "merch" },
    { icon: GiftIcon, key: "perks" },
  ];
  const steps = ["account", "club", "send"] as const;

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero — same pattern as /waitlist */}
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 pt-24 pb-16">
          <Image src="/images/fondoClubes.webp" alt="" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-brand-navy/70" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold text-white md:text-6xl">
              {t("hero.titleA")} <span className="text-brand-lime">{t("hero.titleB")}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/75 md:text-xl">{t("hero.subtitle")}</p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl space-y-20 px-4 py-16">
          {/* Who / What */}
          <div className="grid gap-12 md:grid-cols-2">
            <section>
              <h2 className="mb-6 text-2xl font-bold text-foreground">{t("who.title")}</h2>
              <div className="space-y-5">
                {who.map(({ icon, key }) => (
                  <Feature key={key} icon={icon} title={t(`who.${key}.title`)} description={t(`who.${key}.description`)} />
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-6 text-2xl font-bold text-foreground">{t("offer.title")}</h2>
              <div className="space-y-5">
                {offer.map(({ icon, key }) => (
                  <Feature key={key} icon={icon} title={t(`offer.${key}.title`)} description={t(`offer.${key}.description`)} />
                ))}
              </div>
            </section>
          </div>

          {/* How to apply */}
          <section className="text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">{t("apply.title")}</h2>
            <p className="mx-auto mb-10 max-w-xl text-muted">{t("apply.subtitle")}</p>
            <ol className="grid gap-px border border-line bg-line text-left sm:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step} className="bg-surface-alt p-6">
                  <span className="mb-3 flex h-9 w-9 items-center justify-center bg-brand-green text-base font-extrabold text-brand-navy">
                    {i + 1}
                  </span>
                  <h3 className="mb-1 font-bold text-foreground">{t(`apply.steps.${step}.title`)}</h3>
                  <p className="text-sm text-muted">{t(`apply.steps.${step}.description`)}</p>
                </li>
              ))}
            </ol>

            <a
              href={APPLY_URL}
              className="mt-10 inline-flex items-center justify-center bg-brand-green px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-brand-green/80"
            >
              {t("apply.cta")}
            </a>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">{t("apply.note")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
