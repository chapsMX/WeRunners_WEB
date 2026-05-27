"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
  { qKey: "faq.q7", aKey: "faq.a7" },
  { qKey: "faq.q8", aKey: "faq.a8" },
];

function FaqItem({ qKey, aKey }: { qKey: string; aKey: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-foreground">{t(qKey)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "flex-shrink-0 text-brand-lime transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-muted leading-relaxed">{t(aKey)}</div>
      )}
    </div>
  );
}

export default function Faq() {
  const t = useTranslations();

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-12 text-center">
          {t("faq.headline")}
        </h2>

        <div>
          {FAQ_ITEMS.map(({ qKey, aKey }) => (
            <FaqItem key={qKey} qKey={qKey} aKey={aKey} />
          ))}
        </div>
      </div>
    </section>
  );
}
