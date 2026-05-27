import Image from "next/image";
import Link from "next/link";

/* ─── Social links ───────────────────────────────────────────── */
const SOCIALS = [
  {
    name: "Twitter / X",
    href: "https://x.com/w3runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 5.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/w3runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Farcaster",
    href: "https://farcaster.xyz/w3runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="currentColor" className="w-7 h-7">
        <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
        <path d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
      </svg>
    ),
  },
  {
    name: "Strava",
    href: "https://www.strava.com/clubs/runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    ),
  },
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
