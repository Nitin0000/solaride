# SOLARIDE — SEO Strategy

This document describes how the SOLARIDE site is optimized for search, so the
setup stays consistent as pages are added. Automated checks in
`tests/seo.test.mjs` enforce most of the rules below.

## Goals & audience

- **Primary intent:** "rooftop solar installation" and related buyer queries.
- **Geography:** North India — states of **Punjab, Haryana, Rajasthan** and the
  UT of **Chandigarh**; strongest local presence in **Mohali** and **Hisar**
  (physical offices).
- **Segments:** residential, commercial/industrial, and agricultural (solar
  pumps).

## Per-page on-page checklist

Every indexable page includes:

1. `<html lang="en">` and a responsive `viewport`.
2. A unique `<title>` (≤ 65 chars) containing the brand and primary keyword.
3. A unique meta description (~150–160 chars) mentioning **North India** and the
   relevant regions/segments.
4. Exactly one `<h1>` describing the page.
5. Absolute `canonical` URL on `https://solaride.in`.
6. Self-referential `hreflang` (`en-in`) plus `x-default`.
7. Open Graph (`og:title/description/url/image` — image is absolute) and a
   Twitter `summary_large_image` card.
8. Accurate business identity and contact details; legacy geo and keywords
  meta tags are not a substitute for relevant content or a verified Business Profile.
9. `robots` = `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`
   so SERPs can show large image previews and full snippets.

## Structured data (JSON-LD)

- **Home (`index.html`)** — a single `@graph` with:
  - `Organization` (logo, `sameAs` socials, `contactPoint`, `areaServed`
    including "North India", and a `hasOfferCatalog` of services).
  - Two `LocalBusiness` nodes (Mohali, Hisar) with address + geo-coordinates.
  - `WebSite` and a connected `WebPage`.
  - Office names, phone numbers and addresses match the local pages; each office
    URL points to its canonical local page.
- **Subpages** — a `BreadcrumbList` (`Home` → current page).
- **FAQ (`faq.html`)** — a `FAQPage` whose questions mirror the on-page
  accordion. Google restricts FAQ rich results primarily to authoritative
  government/health sites; do not promise this business FAQ rich results.
- **Buying guide** — Article + BreadcrumbList, visible author/update date and
  official source links. Estimates are labelled, not presented as guarantees.
- **Service-area pages (`solar-panel-installation-*.html`)** — each has a
  `LocalBusiness` (real office address + geo), a `BreadcrumbList`, and a local
  `FAQPage`.

## Local SEO (service-area pages)

Dedicated pages for the two real offices target "solar panel installation in
<city>" intent with unique local copy (DISCOM, subsidy, areas, process, FAQ).
They are linked from the homepage "Areas We Serve" section, the footer, and each
other, and listed in `sitemap.xml`. **Only add a new city page when there is a
real local presence and genuinely unique content** — thin/duplicated city pages
are treated as doorway pages and can hurt rankings.

Validate changes with Google's
[Rich Results Test](https://search.google.com/test/rich-results) and keep the
JSON parseable (covered by tests).

## Crawlability

- `robots.txt` allows all crawlers, including Googlebot, Bingbot, OAI-SearchBot,
  PerplexityBot and Claude-SearchBot via the wildcard rule, and points to the
  sitemap. Tracking-parameter URLs are not blocked: crawlers must be able to
  read their clean canonical. This is a crawl policy, not proof of indexing.
- `sitemap.xml` lists every URL on the canonical HTTPS domain; update it when
  adding/removing pages.
- `CNAME` pins `solaride.in` so Pages redeploys don't drop the custom domain.
- `404.html` is `noindex` and links back into the site.

## Performance (Core Web Vitals)

- The hero/LCP image stays eager; below-the-fold images use
  `loading="lazy" decoding="async"`.
- `npm run build` compiles/minifies Tailwind and generates responsive WebP sizes
  using Sharp. Images have intrinsic dimensions; hero images are prioritised.
- Unused Chart.js/ApexCharts downloads have been removed. Generated assets must
  exist before previewing. CI builds/tests and deploys only `_site/`.
- Measure field LCP, INP and CLS in Search Console after release. Smaller assets
  do not by themselves prove a Core Web Vitals pass or a ranking improvement.

## Keyword themes

| Page          | Primary theme                                        |
| ------------- | ---------------------------------------------------- |
| `index`       | Rooftop solar installation in North India            |
| `solutions`   | Residential / commercial / agricultural solar        |
| `benefits`    | Solar savings calculator, subsidy, payback, CO₂      |
| `faq`         | About SOLARIDE, credibility, origin story            |
| `team`        | Founders & engineers (IIT Bombay, PEC Chandigarh)    |
| `rooftop-solar-guide` | Cost comparison, subsidy, 3 kW/5 kW sizing, backup |

## Content accuracy

- Benefits and solutions headings describe the calculator and installation
  services directly; the FAQ search/social titles cover questions and company background.
- The buying guide is linked from home, FAQ, both office pages, solutions and
  the savings calculator. Keep links relevant to the decision on each page.
- Do not restore unsubstantiated 98% savings, property-value percentages,
  fixed payback periods or undated price-per-kW promises. Use dated, documented
  project examples or itemised quotations when reliable evidence is available.
- Residential subsidy assistance must state eligibility and approval limits;
  commercial and agricultural systems need separate checks. Calculator results
  are preliminary estimates, not quotes or guarantees.
- Pricing answers on FAQ and local pages must match their JSON-LD. Tests guard
  these relationships and the removed financial promises.

## When adding a page

1. Copy the `<head>` conventions above (title, description, canonical, hreflang,
   OG/Twitter, geo, JSON-LD).
2. Add the URL to `sitemap.xml`.
3. Add it to the page lists in `tests/seo.test.mjs` and run `npm test`.

## Off-page / operational (not in this repo)

- Mohali and Hisar local pages are implemented. Add other pages only with real
  service evidence and genuinely useful local detail, not doorway-page templates.
- Create and verify **Google Business Profiles** for the Mohali and Hisar
  offices (maps + local pack).
- Keep NAP (name, address, phone) consistent with the `LocalBusiness` schema.
- Build local citations and gather reviews; earn backlinks from regional and
  clean-energy directories.

## AI search visibility

Google's [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
requires normal indexing and snippet eligibility, not special AI schema or
`llms.txt`. Content is delivered as static HTML with descriptive internal links,
answer-led headings, transparent calculations and sources.

OpenAI's [crawler documentation](https://developers.openai.com/api/docs/bots)
distinguishes OAI-SearchBot (search) from GPTBot (model training). Search access
is allowed. No training-policy change or guaranteed ChatGPT citation is implied.
Other platforms decide their own retrieval and citation eligibility. Robots
allowance does not prove that a CDN, firewall or platform can retrieve a page.

## Launch and measurement checklist

Live checks on 2026-09-22: the apex HTTPS robots and sitemap return 200, and a
missing URL returns 404. However, `http://solaride.in/` returns 200 without an
HTTPS redirect, and `https://www.solaride.in/` fails TLS certificate validation
(`ERR_TLS_CERT_ALTNAME_INVALID`, served certificate does not cover WWW). Enable
**Enforce HTTPS** in GitHub Pages and check WWW DNS/certificate configuration
with the domain owner; confirm WWW redirects to the apex HTTPS canonical.
These hosting settings cannot be fixed by HTML canonical tags alone.

1. Deploy through GitHub Actions and check the live HTML, WebP, CSS, robots and
  sitemap responses. Verify apex/WWW and HTTP/HTTPS redirects, canonical tags,
  and that missing URLs return HTTP 404. Local tests cannot prove live indexing.
2. Verify a Search Console domain property with the owner's DNS access. Submit
  `https://solaride.in/sitemap.xml`, inspect the home, two office pages and guide,
  and request indexing for these key URLs. Avoid automated indexing services.
3. Verify Bing Webmaster Tools and submit the same sitemap. Use URL inspection
  to investigate crawl/index problems. A submission is not a ranking guarantee.
4. Verify eligible Google Business Profiles for each real, staffed location.
  Confirm precise map pins, address visibility, phone, opening hours, categories
  and service areas with the owner. Do not invent hours or registrations.
5. Request honest reviews from real customers without incentives or review
  gating. Publish consented project photos/case studies with actual capacity,
  completion date and measured generation; substantiate existing savings and
  installation-total marketing claims before using them in further content.
6. Record a baseline, then compare 28-day periods: indexed URLs, non-branded
  query impressions, clicks, local discovery, qualified calls and survey leads.
  Prioritise Mohali/Hisar installation intent, then subsidy and sizing queries.
  Separate seasonality and paid traffic from organic changes.
7. Review cited subsidy/utility policies before quoting a customer and whenever
  official rules change. Update visible and structured answers together.

Search Console, Bing and Business Profile ownership/verification are external
requirements and were not performed by editing this repository. No top-ranking
or AI-citation guarantee is possible. Avoid paid links, fake reviews, keyword
stuffing, hidden text and mass-generated city pages.
