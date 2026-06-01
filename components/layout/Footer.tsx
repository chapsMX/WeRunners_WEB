import Link from "next/link";
import Image from "next/image";
import { XIcon, InstagramIcon, FarcasterIcon, StravaIcon } from "@/components/ui/SocialIcons";

const SOCIAL_LINKS = [
  { name: "Twitter/X",  href: "https://x.com/w3runn3rs",                    icon: <XIcon size={18} /> },
  { name: "Instagram",  href: "https://www.instagram.com/w3runn3rs",         icon: <InstagramIcon size={18} /> },
  { name: "Farcaster",  href: "https://farcaster.xyz/w3runn3rs",             icon: <FarcasterIcon size={18} /> },
  { name: "Strava",     href: "https://www.strava.com/clubs/runn3rs",        icon: <StravaIcon size={18} /> },
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
