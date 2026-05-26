import { useTranslations } from "next-intl";

// Empty at launch — structure ready to populate
const LOGOS: { name: string; url: string }[] = [];

export default function AsSeenOn() {
  const t = useTranslations();

  if (LOGOS.length === 0) return null;

  return (
    <section id="as-seen-on" className="py-16 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm uppercase tracking-widest font-medium mb-8">
          {t("asseenon.label")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {LOGOS.map(({ name, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-40 hover:opacity-70 transition-opacity"
            >
              {/* Logo images will go here */}
              <span className="text-slate-400 font-semibold">{name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
