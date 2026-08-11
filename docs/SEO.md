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
8. Geo meta tags (`geo.region`, `geo.placename`, `geo.position`, `ICBM`).

## Structured data (JSON-LD)

- **Home (`index.html`)** — a single `@graph` with:
  - `Organization` (logo, `sameAs` socials, `contactPoint`, `areaServed`
    including "North India", and a `hasOfferCatalog` of services).
  - Two `LocalBusiness` nodes (Mohali, Hisar) with address + geo-coordinates.
  - `WebSite`.
- **Subpages** — a `BreadcrumbList` (`Home` → current page).

Validate changes with Google's
[Rich Results Test](https://search.google.com/test/rich-results) and keep the
JSON parseable (covered by tests).

## Crawlability

- `robots.txt` allows all crawlers and points to the sitemap.
- `sitemap.xml` lists every URL on the canonical HTTPS domain; update it when
  adding/removing pages.
- `CNAME` pins `solaride.in` so Pages redeploys don't drop the custom domain.

## Keyword themes

| Page          | Primary theme                                        |
| ------------- | ---------------------------------------------------- |
| `index`       | Rooftop solar installation in North India            |
| `solutions`   | Residential / commercial / agricultural solar        |
| `benefits`    | Solar savings calculator, subsidy, payback, CO₂      |
| `faq`         | About SOLARIDE, credibility, origin story            |
| `team`        | Founders & engineers (IIT Bombay, PEC Chandigarh)    |

## When adding a page

1. Copy the `<head>` conventions above (title, description, canonical, hreflang,
   OG/Twitter, geo, JSON-LD).
2. Add the URL to `sitemap.xml`.
3. Add it to the page lists in `tests/seo.test.mjs` and run `npm test`.

## Off-page / operational (not in this repo)

- Create and verify **Google Business Profiles** for the Mohali and Hisar
  offices (maps + local pack).
- Keep NAP (name, address, phone) consistent with the `LocalBusiness` schema.
- Build local citations and gather reviews; earn backlinks from regional and
  clean-energy directories.
