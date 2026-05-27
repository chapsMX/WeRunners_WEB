import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import WhatIs from "@/components/sections/WhatIs";
import HowItWorks from "@/components/sections/HowItWorks";
import ForClubs from "@/components/sections/ForClubs";
import ParallaxBanner from "@/components/sections/ParallaxBanner";
// import TheMovement from "@/components/sections/TheMovement";
// import IrlEvents from "@/components/sections/IrlEvents";
import Community from "@/components/sections/Community";
import Faq from "@/components/sections/Faq";
import AsSeenOn from "@/components/sections/AsSeenOn";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "");
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhatIs />
        <HowItWorks />
        <ParallaxBanner />
        <ForClubs />
        {/* <TheMovement /> */}
        {/* <IrlEvents /> */}
        <Community />
        <Faq />
        <AsSeenOn />
      </main>
      <Footer />
    </>
  );
}
