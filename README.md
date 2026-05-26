# W3Runn3rs — We Runners

> **Pick your running club, make it count!**
> The global hub for running clubs.

![License](https://img.shields.io/badge/license-MIT-lime) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Vercel](https://img.shields.io/badge/deployed-Vercel-black)

---

## 🌍 About

W3Runn3rs (**We Runners**) is the global hub for running clubs. Unlike other platforms where a runner can belong to multiple clubs at once, w3runn3rs enforces a simple but powerful rule:

**One runner. One club. Every kilometer counts exclusively for yours.**

This repository contains the landing page and marketing site for [www.w3runn3rs.com](https://www.w3runn3rs.com).

---

## ✨ Features

- 🌐 **Bilingual** — English and Spanish (EN/ES) from day one
- 🌙 **Dark / Light mode** — system-aware with manual toggle
- 🌍 **Interactive 3D Globe** — Three.js powered hero with city nodes
- 📋 **Waitlist + Referral system** — powered by Viral Loops
- 📝 **Blog** — MDX-based, no CMS required
- 📧 **Email notifications** — transactional email via Resend
- 📊 **Analytics** — Google Analytics 4
- 🍪 **Cookie consent** — GDPR compliant

---

## 🗺️ Site Structure

```
www.w3runn3rs.com/
├── /                   → Landing page (onepager)
├── /waitlist           → Waitlist + referral program
├── /events             → IRL Events
├── /blog               → Blog index + articles
├── /for-clubs          → Landing for club administrators
├── /ambassadors        → Ambassador program
├── /privacy-policy     → Privacy Policy
└── /terms-of-service   → Terms of Service
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styles | [Tailwind CSS](https://tailwindcss.com) |
| Deploy | [Vercel](https://vercel.com) |
| Blog | MDX + Contentlayer |
| i18n | [next-intl](https://next-intl-docs.vercel.app) |
| Database | [Neon](https://neon.tech) (PostgreSQL) |
| ORM | [Prisma](https://prisma.io) |
| Email | [Resend](https://resend.com) + React Email |
| Waitlist | [Viral Loops](https://viral-loops.com) |
| Analytics | Google Analytics 4 |
| 3D Globe | Three.js + @react-three/fiber |
| Dark mode | next-themes |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Neon](https://neon.tech) database (PostgreSQL)
- A [Resend](https://resend.com) account with verified domain
- A [Viral Loops](https://viral-loops.com) campaign

### Installation

```bash
# Clone the repository
git clone https://github.com/chapsMX/We_Web.git
cd We_Web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Database
DATABASE_URL=your_neon_connection_string

# Resend
RESEND_API_KEY=your_resend_api_key

# Viral Loops
NEXT_PUBLIC_VIRAL_LOOPS_CAMPAIGN_ID=your_campaign_id

# Google Analytics
NEXT_PUBLIC_GA_ID=G-0SQR3G71T8

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

---

## 📝 Blog

Blog posts are written in MDX and stored in the `content/blog/` directory.

To create a new post, add a `.mdx` file:

```
content/
└── blog/
    └── my-post-slug.mdx
```

Each post requires frontmatter:

```mdx
---
title: My Post Title
date: 2026-05-26
description: A short description of the post.
author: w3runn3rs
---

Content goes here...
```

---

## 🌐 Internationalization

Translations live in the `messages/` directory:

```
messages/
├── en.json   ← English (default)
└── es.json   ← Spanish
```

To add a new translation key, add it to both files.

---

## 📁 Project Structure

```
w3runn3rs/
├── app/
│   └── [locale]/
│       ├── page.tsx
│       ├── waitlist/
│       ├── blog/
│       ├── events/
│       ├── for-clubs/
│       ├── ambassadors/
│       ├── privacy-policy/
│       └── terms-of-service/
├── components/
│   ├── sections/        ← Page sections (Hero, HowItWorks, etc.)
│   ├── ui/              ← Reusable UI components
│   └── layout/          ← Header, Footer
├── content/
│   └── blog/            ← MDX blog posts
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
    └── models/          ← GLTF 3D globe model
```

---

## 🚢 Deployment

The project is deployed on [Vercel](https://vercel.com). Every push to `main` triggers an automatic deployment.

```bash
# Deploy manually (if needed)
vercel --prod
```

Make sure all environment variables are configured in your Vercel project settings.

---

## 🤝 Contributing

This is a private project. For questions or contributions, contact us at [run@w3runn3rs.com](mailto:run@w3runn3rs.com).

---

## 📄 Legal

- [Privacy Policy](https://www.w3runn3rs.com/privacy-policy)
- [Terms of Service](https://www.w3runn3rs.com/terms-of-service)
- Data requests: [data@w3runn3rs.com](mailto:data@w3runn3rs.com)

---

## 📬 Contact

- 🌐 [www.w3runn3rs.com](https://www.w3runn3rs.com)
- 🐦 [Twitter/X](https://x.com/w3runn3rs)
- 📸 Instagram: @w3runn3rs
- 🟣 [Farcaster](https://farcaster.xyz/w3runn3rs)
- 🟠 [Strava Club](https://www.strava.com/clubs/runn3rs)

---

<p align="center">
  <strong>Pick your running club, make it count!</strong><br/>
  © 2026 w3runn3rs. All rights reserved.
</p>