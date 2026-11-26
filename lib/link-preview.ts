// Link previews for URLs that redirect people (e.g. the club invite link): the
// crawler of X, WhatsApp, Facebook, Farcaster, Telegram, Slack… gets a tiny
// HTML page with Open Graph tags instead of following the redirect.

const PREVIEW_BOTS =
  /bot|crawl|spider|facebookexternalhit|facebot|whatsapp|telegram|slack|discord|linkedin|embedly|iframely|skype|pinterest|vkshare|preview|farcaster|warpcast|opengraph|metainspector/i

export function isLinkPreviewBot(userAgent: string | null): boolean {
  return Boolean(userAgent && PREVIEW_BOTS.test(userAgent))
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Minimal page with OG / X card tags (and a refresh for any human that lands here). */
export function linkPreviewHtml(p: { title: string; description: string; url: string; image: string; redirectTo: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="We Runners">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${esc(p.url)}"><meta property="og:image" content="${esc(p.image)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@w3runn3rs">
<meta name="twitter:title" content="${esc(p.title)}"><meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${esc(p.image)}">
<meta http-equiv="refresh" content="0;url=${esc(p.redirectTo)}">
</head><body></body></html>`
}
