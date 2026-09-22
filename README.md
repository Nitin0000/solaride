# SOLARIDE

Marketing website for **SOLARIDE** — premium **rooftop solar panel installation across North India** (Punjab, Haryana, Chandigarh & Rajasthan; offices in Mohali and Hisar). The site markets residential, commercial, and agricultural solar solutions, provides an interactive savings/impact calculator, and captures leads.

- **Live site:** https://solaride.in
- **Stack:** Static HTML + compiled Tailwind + responsive WebP + Alpine.js + vanilla JS
- **Hosting:** GitHub Pages (custom domain via `CNAME`)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Testing](#testing)
- [SEO](#seo)
- [Deployment](#deployment)
- [Conventions](#conventions)

---

## Features

- **Responsive marketing pages** — Home, Solutions, Benefits, Team, About (`faq.html`), plus Privacy and Data Deletion legal pages.
- **Tree-to-Energy calculator** (`benefits.html`) — estimates annual CO₂ offset, tree equivalent, and energy produced from system size and sunlight hours.
- **Solar Savings Calculator** (`benefits.html`) — sizes a system from the user's bill and roof area, shows investment, monthly/annual/lifetime savings, payback, ROI and CO₂; opens a detailed report modal and generates a downloadable `.txt` estimate.
- **FAQ** (`faq.html`) — a 10-question accordion with matching structured data; Google FAQ rich results are restricted and not expected for this business.
- **Buying guide** (`rooftop-solar-guide.html`) — cost, subsidy, sizing, net metering and backup guidance with official sources and Article markup.
- **Service-area pages** (`solar-panel-installation-mohali.html`, `-hisar.html`) — locally-written landing pages for the two offices with `LocalBusiness` + `FAQPage` schema.
- **Lead capture** — contact form wired to [EmailJS](https://www.emailjs.com/); WhatsApp/call CTAs throughout.
- **Accessible UI** — skip link, focus-trapped modals, `aria-expanded` mobile menu, keyboard (Escape) modal dismissal.
- **Branded 404** (`404.html`) — friendly, `noindex` error page with navigation back into the site.
- **Analytics** — Google Ads tag (gtag.js) and a first-party usage beacon.

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Markup         | Hand-authored semantic HTML                         |
| Styling        | Compiled [Tailwind CSS](https://tailwindcss.com/) + `assets/css/styles.css` |
| Interactivity  | Vanilla JS modules under `assets/js/` + Alpine.js   |
| Image build    | Sharp generates responsive WebP variants           |
| Email          | EmailJS browser SDK                                  |
| Tests          | [Vitest](https://vitest.dev/) + jsdom               |
| CI / Hosting   | GitHub Actions → GitHub Pages                        |

`npm run build` compiles CSS, creates responsive images, and stages public files
in `_site/`. Browser scripts remain plain `<script src>` includes. Generated
assets are ignored by Git and must be rebuilt after cloning or changing markup.

## Project structure

```
solaride/
├── index.html              # Home (hero, services, contact)
├── solutions.html          # Residential / commercial / agricultural solutions
├── benefits.html           # Tree-to-Energy calculator + benefits
├── team.html               # Team profiles
├── faq.html                # About / origin story
├── privacy.html            # Privacy policy (legal)
├── data-deletion.html      # Data deletion instructions (legal)
├── assets/
│   ├── css/styles.css      # Project-specific styles on top of Tailwind
│   ├── images/             # Logos, photos, team headshots
│   └── js/
│       ├── calc.js         # Pure calculation helpers (SolarideCalc) — unit-tested
│       ├── calculator.js   # Wires calc results into the DOM
│       ├── utils.js        # formatCurrency, animateValue, trapFocus
│       ├── modals.js       # Generic + team/story modal controllers
│       ├── forms.js        # Contact / newsletter / question forms
│       ├── faq.js          # FAQ accordion + category modals
│       └── main.js         # Nav, smooth scroll, back-to-top, mobile menu
├── tests/                  # Vitest suites (see Testing)
├── CNAME                   # Custom domain: solaride.in
├── robots.txt              # Crawl directives + sitemap reference
├── sitemap.xml             # All indexable URLs
└── .github/workflows/
    ├── static.yml          # Deploy to GitHub Pages
    └── test.yml            # Run the test suite
```

### Script load order

`calc.js` defines the pure `SolarideCalc` API and **must load before**
`calculator.js`, which consumes it. Every page includes them in this order:

```html
<script src="assets/js/utils.js"></script>
<script src="assets/js/modals.js"></script>
<script src="assets/js/calc.js"></script>
<script src="assets/js/calculator.js"></script>
<script src="assets/js/forms.js"></script>
<script src="assets/js/faq.js"></script>
<script src="assets/js/main.js"></script>
```

## Local development

Use Node.js 22+ for the build. Install dependencies and generate assets first:

```bash
npm ci
npm run build
```

Then open `_site/index.html` in your browser. An optional local HTTP server can
serve `_site/` when testing network-dependent features. Rebuild after edits.

### Editorial imagery

Two AI-generated rooftop concepts in `assets/images/editorial/` were generated
with FLUX.1-schnell through Black Forest Labs' public Hugging Face demo. Prompts,
seeds, source links and the Apache-2.0 model licence are recorded in
`scripts/media-prompts.json`. Concept images have no visible disclosure captions;
their provenance remains recorded here and in the manifest. They are not photographs
of completed installations. Real team and journey photos retain their original placements;
additional existing installation photos now support the other content pages.

`npm run generate:media -- solar-horizon` generates a missing named source image.
Existing files are kept. The anonymous demo is quota-limited, has no availability
guarantee and is never called during builds or deployment. Only `solar-horizon`
and `rooftop-life` were generated; other manifest entries are ungenerated briefs.
Further generation was blocked by the provider's anonymous ZeroGPU quota.

Run `npm run build` to create responsive WebP variants. Original photographs are
never modified. Former stock images and procedural renders remain archived and
are not referenced by content pages. The legacy `render:media` workflow is retained
for archival purposes, not used for current website imagery.

### Agricultural photograph credit

The Agricultural Solar card uses **SOLAR POWER IRRIGATION RICE FARMING** by
**SMMIMAGES**, sourced from
[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:SOLAR_POWER_IRRIGATION_RICE_FARMING.jpg)
under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
The photo was resized, slightly cropped to 3:2 and converted to WebP; the adapted
source and responsive variants remain under CC BY-SA 4.0. Attribution and the
licence link are visible on the card. This is an illustrative real installation,
not a photograph of a Solaride project or an AI-generated image.

## Testing

The suite uses **Vitest** with the **jsdom** environment. Browser scripts are
loaded into jsdom via a small `tests/helpers/dom.mjs` loader so the *actual*
shipped files are exercised (no separate build).

```bash
npm test          # build, then run once
npm run test:watch
npm run coverage
```

What is covered:

| Suite                          | Focus                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| `tests/calc.test.mjs`          | Pure math: `treeToEnergy`, `solarSavings`, edge cases, guards    |
| `tests/utils.test.mjs`         | `formatCurrency`, `animateValue`, `trapFocus`                    |
| `tests/calculator.dom.test.mjs`| Calculator wiring: sliders, Calculate button, DOM output         |
| `tests/modals.dom.test.mjs`    | Open/close, Escape, backdrop, scroll lock                        |
| `tests/main.dom.test.mjs`      | Mobile menu `aria-expanded`, back-to-top visibility              |
| `tests/savings.dom.test.mjs`   | Savings calculator: results, report modal, downloadable estimate |
| `tests/faq.dom.test.mjs`       | FAQ accordion open/close/independent toggling                    |
| `tests/forms.dom.test.mjs`     | Contact form via EmailJS                                         |
| `tests/seo.test.mjs`           | Titles, descriptions, canonical, hreflang, OG/Twitter, JSON-LD (Org/LocalBusiness/Breadcrumb/FAQPage), sitemap, robots, CNAME |

CI runs `npm test` on every push to `devVanz`/`main` and on pull requests
(`.github/workflows/test.yml`).

## SEO

The site targets rooftop-solar intent across North India. Highlights:

- Unique, length-optimized `<title>` and meta description per page.
- Absolute `canonical` + self-referential `hreflang` (`en-in`, `x-default`).
- Open Graph + Twitter summary cards with an absolute image.
- Geo meta tags (`geo.region`, `geo.position`, ICBM).
- Structured data: `Organization` + two `LocalBusiness` locations + `WebSite`
  on the home page, `BreadcrumbList` on subpages, and a `FAQPage` on the FAQ.
- Service `OfferCatalog` (residential / commercial / agricultural).
- `robots.txt`, `sitemap.xml`, and a pinned `CNAME`; lazy-loaded below-the-fold images.

These are enforced by `tests/seo.test.mjs`, so regressions fail CI. See
[`docs/SEO.md`](docs/SEO.md) for the full strategy.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture, module map, data flows, deployment.
- [`docs/FEATURES.md`](docs/FEATURES.md) — every implemented feature and the roadmap of proposed ones.
- [`docs/SEO.md`](docs/SEO.md) — the full SEO strategy and checklist.

## Deployment

Pushing to **`devVanz`** triggers `.github/workflows/static.yml`, which installs
dependencies, builds and tests, then uploads only `_site/` to GitHub Pages.
Tests, internal docs and node_modules are not deployed. The custom domain is
pinned by `CNAME`. Configure Pages to use GitHub Actions, not raw branch files.

## Conventions

- **Static asset build only.** Keep scripts as plain browser files; expose testable logic
  on `window` (and `module.exports` when useful) so it can be unit-tested.
- **Pure logic in `calc.js`.** Add new calculations there and wire the DOM
  separately, then cover them in `tests/calc.test.mjs`.
- **SEO is tested.** When adding a page, update `sitemap.xml` and the page lists
  in `tests/seo.test.mjs`.
- Run `npm test` before pushing.
