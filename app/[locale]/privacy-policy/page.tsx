import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PrivacyPolicyEn } from "@/components/legal/PrivacyPolicyEn";
import { PrivacyPolicyEs } from "@/components/legal/PrivacyPolicyEs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const es = locale === "es";
  return buildPageMetadata(locale, "/privacy-policy", {
    title: es ? "Política de privacidad — W3Runn3rs" : "Privacy Policy — W3Runn3rs",
    description: es
      ? "Qué datos recaba W3Runn3rs, para qué los usa, qué es público y cómo controlarlos."
      : "What data W3Runn3rs collects, what it's used for, what's public and how to control it.",
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lime">
          {locale === "es" ? <PrivacyPolicyEs /> : <PrivacyPolicyEn />}
        </div>
      </main>
      <Footer />
    </>
  );
}
