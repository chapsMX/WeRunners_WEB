# W3Runn3rs — Project Context
> This file is the single source of truth for the w3runn3rs landing page project.
> Feed it to Claude Code at the start of every session: `claude "Read CONTEXT.md and continue development"`

---

## 1. Project Overview

**Name:** W3Runn3rs
**Pronunciation:** "We Runners"
**Tagline:** Pick your running club, make it count!
**Subtitle:** The global hub for running clubs.

W3Runn3rs is a global hub for running clubs. Runners join one club, sync their wearables, and compete on leaderboards against clubs worldwide. Unlike Strava, where a runner can belong to many clubs, w3runn3rs enforces **one runner, one club** — making every kilometer exclusive and every leaderboard meaningful.

---

## 2. Messaging Rules

- ✅ We are **running clubs** / **a hub for running clubs**
- ❌ Never use "tribe" or "tribu" — we are clubs, not tribes
- ❌ No Web3 references — the name is legacy/identity only
- The core differentiator: **one runner, one club** — loyalty is exclusive

---

## 3. Domains

| Domain | Use |
|--------|-----|
| `www.w3runn3rs.com` | Main landing page (this project) |
| `app.w3runn3rs.com` | Hub app (future) |
| `w3runn3rs.club` | Redirects to .com |
| `werunners.club` | Redirects to .com |

---

## 4. Social Media

| Platform | Handle | URL |
|----------|--------|-----|
| Twitter/X | @w3runn3rs | https://x.com/w3runn3rs |
| Instagram | @w3runn3rs | — |
| Farcaster | /w3runn3rs | https://farcaster.xyz/w3runn3rs |
| Strava | /clubs/runn3rs | https://www.strava.com/clubs/runn3rs |

---

## 5. Emails

| Email | Use |
|-------|-----|
| `data@w3runn3rs.com` | Privacy Policy, Terms of Service, data requests |
| `run@w3runn3rs.com` | General contact (footer) |

---

## 6. Analytics

- **Google Analytics 4 ID:** `G-0SQR3G71T8`

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS |
| Deploy | Vercel |
| Blog | MDX + Contentlayer |
| i18n | next-intl (EN + ES from day 1) |
| Database | Neon (PostgreSQL) — set up when project is on Vercel |
| ORM | Prisma |
| Email | Resend (domain verified) + React Email |
| Waitlist & Referrals | Viral Loops |
| Analytics | Google Analytics 4 |
| Cookies | next-cookie-consent (GDPR compliant) |
| Dark/Light mode | next-themes |
| 3D Globe (Hero) | Three.js + @react-three/fiber + GLTF faceted model |

---

## 8. Database Schema (Landing)

```prisma
model WaitlistEntry {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  referralCode String   @unique
  referredBy   String?
  createdAt    DateTime @default(now())
}
```

---

## 9. Design Direction

### Visual Identity
- **Style:** Dark mode default, modern, energetic — inspired by running culture
- **Color palette:**
  - Background: `#0a0a0a` / `slate-950`
  - Primary accent: Lime / `#a3e635` (lime-400)
  - Secondary accent: Emerald `#34d399`
  - Text: White / `slate-50`
  - Muted: `slate-400`
- **Typography:** Bold, athletic, high-contrast — avoid Inter/Roboto/Arial
- **Logo:** Placeholder circle with "W3" until final vector asset is provided
- **Tone:** Modern, energetic, inspiring — running culture meets global community

### Hero Design
- **Layout:** Two columns
  - Left (1/3): Logo wordmark + tagline + subtitle + CTA
  - Right (2/3): Interactive 3D globe (Three.js) — faceted GLTF model with city nodes highlighted
- **Globe cities:** CDMX, New York, London, Tokyo, São Paulo, Sydney, Singapore, Nairobi, Rio de Janeiro
- **Reference designs:** Resend.com (dark, minimal, 3D element hero)

### Dark / Light Toggle
- Toggle in header (moon/sun icon)
- Default: dark mode

---

## 10. Site Structure

```
www.w3runn3rs.com
│
├── / (Home — single page)
│   ├── Header (fixed, sticky)
│   ├── Hero
│   ├── What is w3runn3rs
│   ├── How it works
│   ├── For Club Admins
│   ├── The Movement
│   ├── IRL Events
│   ├── Community
│   ├── FAQ
│   ├── As Seen On (logo carousel — empty at launch)
│   └── Footer
│
├── /waitlist
├── /events
├── /blog
│   ├── /blog (index)
│   └── /blog/[slug]
├── /for-clubs
├── /ambassadors
├── /privacy-policy
└── /terms-of-service
```

---

## 11. Header

```
[Logo W3R]  |  Waitlist  Events  Blog  Ambassadors  |  EN/ES  🌙/☀️
```

- Fixed/sticky, backdrop blur
- Mobile: hamburger menu

---

## 12. Section Copy (English)

### Hero
- **H1:** Pick your running club, make it count!
- **Subtitle:** The global hub for running clubs.
- **Body:** Join the platform where running clubs compete, connect and grow. One runner, one club — every kilometer you run counts exclusively for yours.
- **CTA primary:** `Join the Waitlist →`
- **CTA secondary:** `Managing a club? Register your club here →`

---

### What is w3runn3rs
- **Headline:** More than an app. A home for running clubs.
- **Body:**
  > Running clubs are more than just groups of people who run together. They have identity, culture and a sense of belonging that goes beyond the finish line.
  >
  > w3runn3rs is the global hub where running clubs compete, connect and grow — with real data, real rivalries and real community. Every runner belongs to one club only, making every kilometer meaningful and every leaderboard worth fighting for.
  >
  > Whether you're chasing a personal record, traveling the world to race or building the next great running club — this is where it all comes together.

**3 Pillars:**
| Icon | Title | Description |
|------|-------|-------------|
| 🎽 | True Loyalty | One runner, one club. Your effort belongs to your club, not split across many. |
| 📊 | Data That Matters | Sync your wearables. Every km, every run, tracked and counted — for your club. |
| 🌍 | Global Community | Clubs from every corner of the world, competing on one platform. |

---

### How it works
- **Headline:** Getting started is as easy as lacing up.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Sign Up | Create your runner profile in minutes. |
| 2 | Pick Your Club | Browse running clubs from around the world and commit to yours. One runner, one club — choose wisely. |
| 3 | Sync Your Wearable | Connect Strava, Garmin, Suunto or any wearable. We'll sync your data automatically. |
| 4 | Make It Count | Every run you complete adds to your club's leaderboard. Your effort, your club's glory. |

---

### For Club Admins
- **Headline:** Does your running club need a home?
- **Body:** Registering your club on w3runn3rs is free and takes just a few minutes. Once you're in, your club joins the global leaderboard — competing weekly and monthly against running clubs from around the world.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Create your club | Fill in your club name, city, logo and a short description. |
| 2 | Set up your profile | Your club gets its own dashboard — ready from day one. |
| 3 | Invite your runners | Your runners join, sync their wearables and start logging km. |
| 4 | Start competing | Weekly and monthly leaderboards, powered by real data from every run. |

- **CTA:** `Register Your Club — It's Free →`

---

### The Movement
- **Headline:** Forget dating apps. Join a running club.
- **Body:**
  > Something is shifting. People are waking up early instead of staying out late. They're booking flights to run marathons in Tokyo, signing up for HYROX in London or crossing a finish line in New York. They're choosing running clubs over bars, race bibs over concert tickets.
  >
  > Running is no longer just a sport — it's an identity, a social circle and a reason to see the world.
  >
  > w3runn3rs was built for this moment. A platform where running clubs are the center of it all — competing, connecting and showing up, both online and in the real world.

**3 Impact Phrases:**
| | Title | Body |
|-|-------|------|
| 🌍 | Runners travel the world | to race. |
| 🏅 | Running clubs | are the new social circles. |
| 🏃 | Every km counts. | Every run matters. |

---

### IRL Events
- **Headline:** Discover IRL Events.
- **Subtitle:** Find running events near you or create your own. Marathons, HYROX, fun runs, club meetups — all in one place.

| Icon | Title | Description |
|------|-------|-------------|
| 🔍 | Find an Event | Discover races and meetups happening near you. |
| ➕ | Create an Event | Organize your own event and invite the running community. |

---

### Community
- **Headline:** We're already running.
- **Subtitle:** Join thousands of runners and clubs already moving with w3runn3rs. Follow us, connect with the community and never run alone.
- **CTA:** `Join the Waitlist →`
- Socials: Twitter/X, Instagram, Farcaster, Strava

---

### FAQ

| Question | Answer |
|----------|--------|
| What is w3runn3rs? | w3runn3rs is the global hub for running clubs. A platform where runners join one club, sync their wearables and compete on leaderboards against clubs from around the world. |
| Why can I only belong to one club? | Because real loyalty matters. Unlike other platforms where your kilometers are spread across multiple clubs, w3runn3rs makes every run count exclusively for yours. One runner, one club — that's what makes the competition real. |
| What wearables can I connect? | You can connect Strava, Garmin, Suunto and other major platforms. Once connected, your activity syncs automatically. |
| Is it free to join? | Yes. Creating a runner account and joining a club is completely free. |
| Can I switch clubs? | Yes, but with restrictions. We want club loyalty to mean something — details on club switching will be available at launch. |
| How do I register my club? | Through a simple form — club name, city, logo, description and number of runners. It takes less than 5 minutes and it's free. |
| How do leaderboards work? | Leaderboards reset every week (Sunday to Saturday) and every month. Clubs are ranked by total kilometers logged by their members. Individual runners are also ranked within their club by kilometers and number of activities. |
| Will there be paid plans for clubs? | The base plan is free. Premium features for clubs are coming soon — stay tuned. |

---

### As Seen On
- Logo carousel — empty at launch, structure ready to populate.

---

## 13. /ambassadors Page

- **Headline:** Run with us. Lead the pack.
- **Subtitle:** We're looking for passionate runners with a voice. People who live and breathe running culture and want to be part of building something global from the ground up.
- **Body:**
  > The w3runn3rs Ambassador Program is built for runners who inspire others — on the road and online. If you have an engaged community, a passion for running and the drive to help grow the world's most committed running hub, we want to hear from you.

**Who we're looking for:**
| Icon | Title | Description |
|------|-------|-------------|
| 🏃 | Passionate runners | You run, you race, you live the culture. |
| 📱 | Active on social media | Strong presence on Instagram and/or Twitter with an engaged running audience. |
| 🌍 | Community builders | You bring people together and inspire them to move. |

**What we offer:**
| Icon | Title | Description |
|------|-------|-------------|
| 🚀 | Early Access | Be the first to access the platform before anyone else. |
| 👕 | Exclusive Merch | Official w3runn3rs gear — before it's available to the public. |
| 🎁 | More Perks | Economic compensation and more. Details shared with selected ambassadors. |

**Application Form Fields:**
- Full name
- Email
- Country (dropdown)
- Instagram handle (@)
- Twitter/X handle (@)
- TikTok handle (@)
- Why do you want to be a w3runn3rs ambassador? (textarea)

**Note below form:**
> You don't need to be active on all platforms — just the ones where you genuinely connect with your running community.

**CTA:** `Apply to become an Ambassador →`
**Subtext:** Applications are reviewed on a rolling basis. Only shortlisted candidates will be contacted.

---

## 14. Footer

```
[Logo]  The global hub for running clubs.        [Twitter] [Instagram] [Farcaster] [Strava]
        Pick your running club, make it count!

        Privacy Policy · Terms of Service · run@w3runn3rs.com

        © 2026 w3runn3rs. All rights reserved.
```

---

## 15. Legal Pages

Both pages exist as `/privacy-policy` and `/terms-of-service`.
- Data/legal contact: `data@w3runn3rs.com`
- Jurisdiction: Mexico City, Mexico
- Minimum age: 18 years
- Google Analytics cookie disclosure included in Privacy Policy

---

## 16. i18n Notes

- All pages bilingual: English (EN) + Spanish (ES) from day 1
- Language toggle in header
- Translation files: `messages/en.json` and `messages/es.json`
- Default language: English

---

## 17. Project File Structure

```
w3runn3rs/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── waitlist/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── for-clubs/page.tsx
│   │   ├── events/page.tsx
│   │   ├── ambassadors/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   └── terms-of-service/page.tsx
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── WhatIs.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ForClubs.tsx
│   │   ├── TheMovement.tsx
│   │   ├── IrlEvents.tsx
│   │   ├── Community.tsx
│   │   ├── Faq.tsx
│   │   └── AsSeenOn.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── content/
│   └── blog/          ← .mdx files
├── messages/
│   ├── en.json
│   └── es.json
├── lib/
│   ├── db.ts
│   └── resend.ts
├── prisma/
│   └── schema.prisma
└── public/
    ├── images/
    └── models/        ← GLTF 3D globe model
```

---

## 18. Globe (Hero) Implementation Notes

- Library: Three.js + `@react-three/fiber` + `@react-three/drei`
- Model: Faceted low-poly globe in `.glb` / `.gltf` format (place in `/public/models/globe.glb`)
- City nodes highlighted: CDMX, New York, London, Tokyo, São Paulo, Sydney, Singapore, Nairobi, Rio de Janeiro
- Behavior: Auto-rotate, subtle tilt on mouse move
- Color: Dark base + lime/emerald accent nodes
- Fallback: CSS animated sphere if WebGL unavailable

**Recommended free GLTF globe sources:**
- Sketchfab: search "low poly earth faceted"
- Quaternius.com (free low-poly packs)
- Place final file at: `public/models/globe.glb`

---

## 19. Pending Before Launch

- [ ] Add final vector logo (replace W3 placeholder)
- [ ] Viral Loops campaign ID (account created)
- [ ] Neon connection string (set up when Vercel project is created)
- [ ] Upload GLTF globe model to `/public/models/`
- [ ] Populate `messages/es.json` with Spanish translations
- [ ] Add real photos/video to Hero and The Movement sections
- [ ] Populate As Seen On logos when media coverage exists
