import Image from "next/image";
import Link from "next/link";
import { XIcon, InstagramIcon, FarcasterIcon, StravaIcon } from "@/components/ui/SocialIcons";

/* ─── Social links ───────────────────────────────────────────── */
const SOCIALS = [
  { name: "Twitter / X", href: "https://x.com/w3runn3rs",                 icon: <XIcon size={28} /> },
  { name: "Instagram",   href: "https://www.instagram.com/w3runn3rs",     icon: <InstagramIcon size={28} /> },
  { name: "Farcaster",   href: "https://farcaster.xyz/w3runn3rs",         icon: <FarcasterIcon size={28} /> },
  { name: "Strava",      href: "https://www.strava.com/clubs/runn3rs",    icon: <StravaIcon size={28} /> },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function GlobalNotFound() {
  return (
    <main className="relative flex flex-col" style={{ minHeight: "100dvh" }}>

        {/* Background image + overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/fondoError.jpg"
            alt="404 background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[#11326e]/70" />
        </div>

        {/* Central content */}
        <div className="flex-1 flex items-center justify-center px-6 py-32">
          <div className="text-center max-w-lg">

            <p className="font-mono font-black text-[10rem] leading-none text-[#63f807] drop-shadow-lg mb-2">
              404
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Page not found
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Looks like this route went off course.
              <br />
              Let&apos;s get you back on track.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#63f807] hover:bg-[#30bc18]
                         text-[#11326e] font-extrabold text-base px-8 py-4 rounded-full
                         transition-colors duration-200"
            >
              ← Back to home
            </Link>

            {/* Social icons */}
            <div className="flex justify-center items-center gap-8 mt-14">
              {SOCIALS.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-white/70 hover:text-[#63f807] transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>

          </div>
        </div>

    </main>
  );
}
