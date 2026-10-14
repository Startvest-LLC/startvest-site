# startvest-site

Source for **startvest.ai**: a static Astro site with the blog at `/blog`, served by a Cloudflare Worker that only hosts static assets.

It replaces the old Startvest Tools SPA (`Startvest-LLC/startvest-ui`, Azure Static Web Apps) and the separate `blog.startvest.ai` Next.js app (`Startvest-LLC/startvest-blog`, Azure App Service).

## Routes

| Path | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/blog`, `/blog/<slug>` | `src/content/blog/*.md` |
| `/rss.xml` | `src/pages/rss.xml.js` |
| `/tom-pinder` | `src/pages/tom-pinder.astro` |
| `/tom-pinder/brief.md` | `public/tom-pinder/brief.md` (copied verbatim from the old repo) |
| `/capabilities` | `src/pages/capabilities.astro` (govcon reference page, not blog content) |
| `/contact` | `src/pages/contact.astro` |
| `/sitemap-index.xml` | `@astrojs/sitemap` |
| legacy URLs | `public/_redirects` (301s) |

## Writing a post

Add `src/content/blog/<slug>.md`:

```yaml
---
title: "Problem stated in the searcher's words"
description: "Two-sentence direct answer."
publishedAt: 2026-10-20
category: "Operational AI"        # or "AI Enablement Methods"
tags: ["Point of View"]           # optional
draft: true                       # drafts never build in production
---
```

Before you flip `draft` to false, run the three checks: operator depth, an inspectable artifact, the honest method. Production builds leave drafts out. They show under `npm run dev`.

## Commands

```sh
npm install
npm run dev          # local, drafts visible
npm run build        # dist/
npm run check:voice  # fails on em dashes or banned words in dist/
npx wrangler dev     # serve dist/ the way Workers static assets will, with _redirects and _headers applied
```

## Deploy (first time)

1. `npm install && npm run build && npm run check:voice`
2. `npx wrangler login`
3. `npx wrangler deploy`. This publishes to `startvest-site.<account>.workers.dev` only and doesn't touch startvest.ai.
4. Check the workers.dev URL: every route, a few legacy redirects, and `/tom-pinder/brief.md`.

## Cutover checklist (startvest.ai to this Worker)

Do these before you uncomment `routes` in `wrangler.jsonc`:

- [ ] **Decide what happens to the `startvest-brief-md` Worker routes.** A separate Worker (`E:\development\buffer-engagement-fetcher\cloudflare-workers\startvest-brief-md`) holds the routes `startvest.ai/brief.md` and `startvest.ai/.well-known/brief.md`. It proxies an outdated "startvest-govcon" brand brief from marketing.startvest.ai. Worker routes take priority over this site's static assets, so those two paths keep serving the old brief until that Worker's routes are removed or changed.
- [ ] Check the DNS automation in the idealift repo (`infra/cloudflare/main.tf`, `scripts/cloudflare-dns-sync.sh`), so a later sync doesn't revert the startvest.ai records.
- [ ] Remove or replace the existing proxied `startvest.ai` and `www` DNS records that point at Azure SWA. Attaching a Worker custom domain needs the hostname free.
- [ ] Uncomment `routes` in `wrangler.jsonc`, then run `npx wrangler deploy`.
- [ ] Set up 301s from `blog.startvest.ai/*` to `https://startvest.ai/blog` with a Cloudflare Redirect Rule (Single Redirect) on the zone, then retire the `startvest-blog-landing` App Service.
- [ ] Retire the Azure Static Web App for the old SPA once traffic is confirmed on the Worker.
- [ ] Search Console: submit `https://startvest.ai/sitemap-index.xml`.

## Legacy redirect notes

- `/blog/<old-slug>` from the old SPA is **not** redirected, because `/blog/*` now holds real posts. Old slugs fall through to the 404 page.
- `/tools/*` covered Chrome-extension privacy and terms pages (`/tools/<ext>/privacy`, `/terms`). They now 301 to `/`. If any of those extensions is still listed in the Chrome Web Store, its privacy-policy URL breaks.
- Admin, security, integrations and similar app-only paths not listed in `_redirects` return 404.

## Voice

Tom's rules from `brief.md`: no em dashes, and none of these words: leverage, passionate, thought leader, synergy, cutting-edge, seamless, game-changer, best-in-class, revolutionize, enterprise-grade, disrupt, bespoke. `npm run check:voice` enforces them on the build.
