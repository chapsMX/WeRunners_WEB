import Link from "next/link";
import Image from "next/image";

const SOCIAL_LINKS = [
  {
    name: "Twitter/X",
    href: "https://x.com/w3runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 5.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/w3runn3rs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1000 1000" fill="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface-alt border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left: Brand */}
          <div>
            <div className="mb-3">
              <Image
                src="/images/logoAzul.png"
                alt="w3runn3rs"
                width={980}
                height={656}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-muted text-sm max-w-xs">
              The global hub for running clubs.
              <br />
              Pick your running club, make it count!
            </p>
          </div>

          {/* Right: Socials */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brand-lime transition-colors"
                aria-label={name}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted/70 text-sm">
            © 2026 w3runn3rs. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/en/privacy-policy"
              className="text-muted/70 hover:text-foreground/80 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-700">·</span>
            <Link
              href="/en/terms-of-service"
              className="text-muted/70 hover:text-foreground/80 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-slate-700">·</span>
            <a
              href="mailto:run@w3runn3rs.com"
              className="text-muted/70 hover:text-foreground/80 transition-colors"
            >
              run@w3runn3rs.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
