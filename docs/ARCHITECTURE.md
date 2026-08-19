# SOLARIDE — Architecture

A reference for how the site is built so decisions live in docs, not memory.

## Overview

SOLARIDE is a **static, multi-page website** — hand-authored HTML styled with
Tailwind (via CDN) and progressively enhanced with small vanilla-JS modules.
There is **no build step, no server, and no database**. The only "backend" is
third-party [EmailJS](https://www.emailjs.com/), which delivers the contact form
straight to the company inbox from the browser.

```
Browser ──> GitHub Pages (static files, https://solaride.in)
   │
   ├─ EmailJS  (contact form submissions)
   ├─ gtag.js  (Google Ads conversion tag)
   └─ vanshul.com/a.js  (first-party usage beacon)
```

### Why static?

- The content is marketing + lead capture; it does not need server state.
- Static hosting on GitHub Pages is free, fast, and trivially cacheable (good
  for Core Web Vitals and SEO).
- Zero build keeps the repo deployable exactly as committed.

## Pages

| File                 | Purpose                                              | Indexed |
| -------------------- | ---------------------------------------------------- | ------- |
| `index.html`         | Home: hero, services, contact form                   | ✅      |
| `solutions.html`     | Residential / commercial / agricultural solutions    | ✅      |
| `benefits.html`      | Savings calculator + Tree-to-Energy calculator       | ✅      |
| `faq.html`           | About/origin story **and** the FAQ accordion         | ✅      |
| `team.html`          | Team profiles + modals                               | ✅      |
| `solar-panel-installation-mohali.html` | Mohali service-area landing page   | ✅      |
| `solar-panel-installation-hisar.html`  | Hisar service-area landing page    | ✅      |
| `privacy.html`       | Privacy policy (legal)                               | ✅      |
| `data-deletion.html` | Data deletion instructions (legal)                   | ✅      |
| `404.html`           | Branded not-found page                               | ❌ noindex |

## JavaScript modules (`assets/js/`)

Service-area landing pages (`solar-panel-installation-*.html`) reuse the shared
header/footer/scripts chrome but ship their own unique local content and
`LocalBusiness` + `BreadcrumbList` + `FAQPage` JSON-LD. Add new ones only for
locations with a real presence, and register them in `sitemap.xml` and the
`CONTENT_PAGES` list in `tests/seo.test.mjs`.

All modules are plain browser scripts. Testable logic is exposed on `window`
(and `module.exports` where useful) so it can be unit-tested without a bundler.

| Module          | Responsibility                                                                 | Exposes |
| --------------- | ------------------------------------------------------------------------------ | ------- |
| `calc.js`       | **Pure** calculation helpers — no DOM.                                          | `window.SolarideCalc` |
| `calculator.js` | Wires both calculators to the DOM; builds/downloads the savings report.         | — |
| `utils.js`      | `formatCurrency`, `animateValue`, `trapFocus`.                                  | `window.SolarideUtils` |
| `modals.js`     | Generic modal open/close (Escape, backdrop, scroll-lock) + team/story modals.  | `window.openModal`, `window.closeModal` |
| `forms.js`      | Contact form submission via EmailJS.                                            | — |
| `faq.js`        | FAQ accordion toggling.                                                         | — |
| `main.js`       | Mobile menu, smooth scroll, back-to-top, misc interactions.                    | — |

### Script load order (every page)

`calc.js` **must** load before `calculator.js`, which consumes `SolarideCalc`:

```html
<script src="assets/js/utils.js"></script>
<script src="assets/js/modals.js"></script>
<script src="assets/js/calc.js"></script>
<script src="assets/js/calculator.js"></script>
<script src="assets/js/forms.js"></script>
<script src="assets/js/faq.js"></script>
<script src="assets/js/main.js"></script>
```

## Key data flows

### Solar Savings Calculator (`benefits.html`)

```
inputs (monthly bill, roof area, sunlight)
  → SolarideCalc.solarSavings()   [pure]
  → results panel + report modal   [calculator.js]
  → "Download estimate" builds a Blob and triggers a .txt download
  → "Get a free site survey" scrolls to contact / index.html#contact
```

The savings calculator writes to IDs prefixed `savings-*` to avoid colliding
with the Tree-to-Energy calculator that shares the same page.

### Tree-to-Energy Calculator (`benefits.html`)

```
sliders (system size, sunlight hours)
  → SolarideCalc.treeToEnergy()   [pure]
  → animated result counters       [calculator.js + utils.animateValue]
```

### Contact form (`index.html`, `faq.html`)

```
submit → FormData(name/email/phone/subject/message)
       → emailjs.send(service, template, params)
       → success-modal | error alert
```

`FormData` is used deliberately: `form.name` resolves to the form's own `name`
attribute, not the `name` input, so field access must go through `FormData`.

## Testing architecture

- **Runner:** Vitest with the `jsdom` environment (`vitest.config.mjs`).
- **No build:** tests load the *actual shipped* scripts through
  `tests/helpers/dom.mjs`, which reads a file and evaluates it in the jsdom
  global scope (indirect `eval`). This means tests exercise exactly what ships.
- **Pure logic** (`calc.js`) is imported directly; **DOM behaviors** are driven
  by building a fixture, loading the script, and dispatching `DOMContentLoaded`.
- **SEO** is asserted structurally against the real HTML files so meta/schema
  regressions fail CI.

## Deployment

- **Trigger:** push to `devVanz`.
- **Workflow:** `.github/workflows/static.yml` uploads the repo and deploys to
  GitHub Pages. `.github/workflows/test.yml` runs `npm ci && npm test`.
- **Domain:** `CNAME` pins `solaride.in` so redeploys keep the custom domain.

## Constraints & conventions

- No framework, no bundler — keep modules small and DOM-guarded (`if (!el) return`).
- Put new math in `calc.js` (pure) and cover it in `tests/calc.test.mjs`.
- When adding a page: update `sitemap.xml` and the page lists in `tests/seo.test.mjs`.
- Keep the LCP hero image eager; lazy-load below-the-fold images.
