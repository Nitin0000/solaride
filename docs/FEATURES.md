# SOLARIDE — Features & Roadmap

Covers every implemented feature (with the files that power it) and a roadmap of
proposed/potential features so future work has a single reference.

## Implemented features

### Solar Savings Calculator
- **Where:** `benefits.html` (`#savings-calculator`)
- **Code:** `assets/js/calc.js` (`solarSavings`), `assets/js/calculator.js`
- **What:** From monthly bill, roof area, and sunlight level it estimates system
  size, investment, monthly/annual/lifetime savings, payback, ROI, CO₂ cut, and
  tree equivalent. Opens a **detailed report modal** and generates a
  **downloadable `.txt` estimate** (client-side Blob — no backend).
- **Tests:** `tests/calc.test.mjs`, `tests/savings.dom.test.mjs`

### Tree-to-Energy Calculator
- **Where:** `benefits.html`
- **Code:** `calc.js` (`treeToEnergy`), `calculator.js`, `utils.animateValue`
- **What:** Two sliders animate CO₂ offset, tree equivalent, and annual energy.
- **Tests:** `tests/calc.test.mjs`, `tests/calculator.dom.test.mjs`

### FAQ
- **Where:** `faq.html` (`#faqs`)
- **Code:** `assets/js/faq.js`
- **What:** 10-question accordion (subsidy, net metering, cost, savings, roof
  area, warranty, timeline, maintenance, segments, coverage) with `FAQPage`
  JSON-LD for rich results. Includes an "Ask us on WhatsApp" CTA.
- **Tests:** `tests/faq.dom.test.mjs`, `tests/seo.test.mjs`

### Lead capture (contact form)
- **Where:** `index.html`, `faq.html` (`#contact`)
- **Code:** `assets/js/forms.js` (EmailJS)
- **What:** Sends the enquiry to the company inbox and shows a success modal.
  WhatsApp/call CTAs appear site-wide.

### Modals
- **Code:** `assets/js/modals.js`, `utils.trapFocus`
- **What:** Generic controller for any `*-modal` (Escape, backdrop click, scroll
  lock, focus trap) plus team and story modals and the savings report modal.

### Navigation & UX
- **Code:** `assets/js/main.js`
- **What:** Mobile menu (`aria-expanded`), smooth in-page scroll, back-to-top.

### Service-area landing pages
- **Where:** `solar-panel-installation-mohali.html`, `solar-panel-installation-hisar.html`
- **What:** Dedicated, uniquely-written local pages for the two real offices —
  local DISCOM (PSPCL / DHBVN), subsidy, areas covered, process, and a local FAQ
  accordion. Each carries `LocalBusiness` + `BreadcrumbList` + `FAQPage` schema
  and is linked from the homepage "Areas We Serve" section, the footer, and each
  other. Listed in `sitemap.xml`; validated by `tests/seo.test.mjs`.

### SEO infrastructure
- Per-page titles/descriptions, canonical, hreflang, OG/Twitter, geo meta.
- `robots` with `max-image-preview:large` (larger SERP thumbnails); CDN
  `preconnect`/`dns-prefetch` for faster first render.
- Structured data: Organization + LocalBusiness ×2 + WebSite + OfferCatalog
  (home), BreadcrumbList (subpages), FAQPage (FAQ + city pages).
- `robots.txt`, `sitemap.xml`, `CNAME`, lazy-loaded imagery.
- See [`SEO.md`](SEO.md).

### Branded 404
- **Where:** `404.html` — `noindex`, links back into the site.

### Analytics
- Google Ads `gtag.js` and a first-party usage beacon (`vanshul.com/a.js`).

## Roadmap — proposed / potential features

Prioritized ideas. None are implemented yet; each notes the main considerations.

### SEO / content
1. **More service-area pages** — Mohali and Hisar are live
   (`solar-panel-installation-*.html`). Expand only to areas with real presence
   (e.g. Chandigarh, Zirakpur, Panchkula, Hansi, Fatehabad) with genuinely unique
   local copy — avoid thin/doorway duplicates.
2. **Blog / resources** — subsidy guides, net-metering how-tos, case studies.
   Adds fresh, long-tail content. Needs an index page + `Article` schema.
3. **Customer reviews / testimonials** — with `Review`/`AggregateRating` schema
   (only with genuine, verifiable reviews).
4. **Project gallery** — real installation photos with `ImageObject` schema.
5. **Hindi localization** — `hreflang` `hi-in` variants for regional reach.

### Product / lead-gen
6. **Persist leads** — currently EmailJS only. A lightweight backend
   (serverless function + sheet/DB) would capture and track enquiries.
7. **Newsletter** — a real subscribe flow (needs a store/ESP). The previous
   front-end-only stub was removed as it had no backend.
8. **WhatsApp pre-fill from calculator** — pass the computed system size/savings
   into the WhatsApp message for warmer leads.
9. **PDF report** — upgrade the `.txt` download to a styled PDF.

### Quality / performance
10. **Self-host Tailwind + purge** — replace the CDN with a built, purged
    stylesheet to cut CSS weight and remove a render-blocking request.
11. **Optimize images** — convert large JP/PNG to WebP/AVIF with proper
    `width`/`height`; finish lazy-loading remaining below-the-fold images.
12. **Accessibility audit** — automated (axe) checks in CI.
13. **Lighthouse CI** — track Core Web Vitals over time.

## Known non-goals

- No database or authenticated area — the site is intentionally static.
- No client-side framework — vanilla JS keeps payload and complexity low.
