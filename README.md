# SOLARIDE

Marketing website for **SOLARIDE** — premium **rooftop solar panel installation across North India** (Punjab, Haryana, Chandigarh & Rajasthan; offices in Mohali and Hisar). The site markets residential, commercial, and agricultural solar solutions, provides an interactive savings/impact calculator, and captures leads.

- **Live site:** https://solaride.in
- **Stack:** Static HTML + Tailwind (CDN) + Alpine.js + vanilla JS
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
- **FAQ** (`faq.html`) — a 10-question accordion with `FAQPage` structured data for rich results.
- **Service-area pages** (`solar-panel-installation-mohali.html`, `-hisar.html`) — locally-written landing pages for the two offices with `LocalBusiness` + `FAQPage` schema.
- **Lead capture** — contact form wired to [EmailJS](https://www.emailjs.com/); WhatsApp/call CTAs throughout.
- **Accessible UI** — skip link, focus-trapped modals, `aria-expanded` mobile menu, keyboard (Escape) modal dismissal.
- **Branded 404** (`404.html`) — friendly, `noindex` error page with navigation back into the site.
- **Analytics** — Google Ads tag (gtag.js) and a first-party usage beacon.

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Markup         | Hand-authored semantic HTML                         |
| Styling        | [Tailwind CSS](https://tailwindcss.com/) via CDN + `assets/css/styles.css` |
| Interactivity  | Vanilla JS modules under `assets/js/` + Alpine.js   |
| Charts         | Chart.js / ApexCharts (CDN)                         |
| Email          | EmailJS browser SDK                                  |
| Tests          | [Vitest](https://vitest.dev/) + jsdom               |
| CI / Hosting   | GitHub Actions → GitHub Pages                        |

There is **no build step** — scripts are plain `<script src>` includes, so the
repo deploys exactly as-is.

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

No toolchain is required to view the site — open any HTML file, or serve the
folder to exercise relative paths and scripts:

```bash
# Python (built-in)
python3 -m http.server 8000
# then visit http://localhost:8000
```

To run the tests you need Node.js 20+:

```bash
npm install
```

## Testing

The suite uses **Vitest** with the **jsdom** environment. Browser scripts are
loaded into jsdom via a small `tests/helpers/dom.mjs` loader so the *actual*
shipped files are exercised (no separate build).

```bash
npm test          # run once
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

Pushing to **`devVanz`** triggers `.github/workflows/static.yml`, which uploads
the repository and deploys it to GitHub Pages. The custom domain is pinned by
the `CNAME` file so it survives redeploys.

## Conventions

- **No build step.** Keep scripts as plain browser files; expose testable logic
  on `window` (and `module.exports` when useful) so it can be unit-tested.
- **Pure logic in `calc.js`.** Add new calculations there and wire the DOM
  separately, then cover them in `tests/calc.test.mjs`.
- **SEO is tested.** When adding a page, update `sitemap.xml` and the page lists
  in `tests/seo.test.mjs`.
- Run `npm test` before pushing.
