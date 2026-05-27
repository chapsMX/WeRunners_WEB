import Link from "next/link";

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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.89 2C6.43 2 2 6.43 2 11.89s4.43 9.89 9.89 9.89 9.89-4.43 9.89-9.89S17.36 2 11.89 2zm4.4 14.02h-2.08v-4.96c0-.9-.72-1.62-1.62-1.62s-1.62.72-1.62 1.62v4.96H8.89V8.09h1.79v.91c.53-.67 1.35-1.1 2.27-1.1 1.62 0 2.93 1.32 2.93 2.93v5.19h.41z" />
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
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-black font-extrabold text-sm">
                W3
              </div>
              <span className="font-extrabold text-foreground text-lg">
                w3runn3rs
              </span>
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
                className="text-muted hover:text-brand-lime transition-colors"
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
