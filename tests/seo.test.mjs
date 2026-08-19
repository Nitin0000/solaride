import { describe, it, expect } from 'vitest';
import { readRepoFile } from './helpers/dom.mjs';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './helpers/dom.mjs';

const DOMAIN = 'https://solaride.in';

const CONTENT_PAGES = [
  { file: 'index.html', canonical: `${DOMAIN}/` },
  { file: 'solutions.html', canonical: `${DOMAIN}/solutions.html` },
  { file: 'benefits.html', canonical: `${DOMAIN}/benefits.html` },
  { file: 'faq.html', canonical: `${DOMAIN}/faq.html` },
  { file: 'team.html', canonical: `${DOMAIN}/team.html` }
];

const ALL_PAGES = [
  ...CONTENT_PAGES.map((p) => p.file),
  'privacy.html',
  'data-deletion.html'
];

function parse(html) {
  return new window.DOMParser().parseFromString(html, 'text/html');
}

function meta(doc, selector) {
  const el = doc.querySelector(selector);
  return el ? el.getAttribute('content') : null;
}

describe.each(CONTENT_PAGES)('SEO essentials — $file', ({ file, canonical }) => {
  const doc = parse(readRepoFile(file));

  it('declares the page language', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
  });

  it('has a responsive viewport', () => {
    expect(meta(doc, 'meta[name="viewport"]')).toMatch(/width=device-width/);
  });

  it('has a concise, non-empty <title>', () => {
    const title = doc.querySelector('title')?.textContent?.trim() ?? '';
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(70);
    expect(title).toMatch(/SOLARIDE/i);
  });

  it('has a well-sized meta description', () => {
    const desc = meta(doc, 'meta[name="description"]') ?? '';
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(165);
  });

  it('targets North India in the description', () => {
    expect(meta(doc, 'meta[name="description"]')).toMatch(/North India/i);
  });

  it('has the correct absolute canonical URL', () => {
    const href = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(href).toBe(canonical);
  });

  it('is indexable (no noindex)', () => {
    expect(meta(doc, 'meta[name="robots"]') ?? 'index').not.toMatch(/noindex/i);
  });

  it('allows large image previews in SERPs', () => {
    expect(meta(doc, 'meta[name="robots"]') ?? '').toMatch(/max-image-preview:large/);
  });

  it('has exactly one <h1>', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  it('has complete Open Graph tags with an absolute image', () => {
    expect(meta(doc, 'meta[property="og:title"]')).toBeTruthy();
    expect(meta(doc, 'meta[property="og:description"]')).toBeTruthy();
    expect(meta(doc, 'meta[property="og:url"]')).toMatch(/^https:\/\/solaride\.in/);
    expect(meta(doc, 'meta[property="og:image"]')).toMatch(/^https:\/\//);
  });

  it('has a Twitter summary card', () => {
    expect(meta(doc, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('declares self-referential hreflang for India + x-default', () => {
    const alts = [...doc.querySelectorAll('link[rel="alternate"]')].map((l) => ({
      lang: l.getAttribute('hreflang'),
      href: l.getAttribute('href')
    }));
    const enIn = alts.find((a) => a.lang === 'en-in');
    const xDefault = alts.find((a) => a.lang === 'x-default');
    expect(enIn?.href).toBe(canonical);
    expect(xDefault?.href).toBe(canonical);
  });

  it('references an og:image that exists on disk', () => {
    const img = meta(doc, 'meta[property="og:image"]').replace(`${DOMAIN}/`, '');
    expect(existsSync(resolve(repoRoot, img))).toBe(true);
  });
});

describe('Structured data (index.html)', () => {
  const doc = parse(readRepoFile('index.html'));
  const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')];

  it('includes at least one JSON-LD block', () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('is valid JSON describing an Organization + LocalBusiness serving North India', () => {
    const graph = blocks.flatMap((b) => {
      const json = JSON.parse(b.textContent);
      return json['@graph'] ?? [json];
    });
    const types = graph.map((n) => n['@type']).flat();
    expect(types).toContain('Organization');
    expect(types).toContain('LocalBusiness');

    const org = graph.find((n) => n['@type'] === 'Organization');
    const areas = JSON.stringify(org.areaServed ?? []);
    expect(areas).toMatch(/North India/);
    expect(org.sameAs?.length ?? 0).toBeGreaterThan(0);
  });

  it('advertises the rooftop solar service catalog', () => {
    const graph = blocks.flatMap((b) => {
      const json = JSON.parse(b.textContent);
      return json['@graph'] ?? [json];
    });
    const org = graph.find((n) => n['@type'] === 'Organization');
    const offers = org.hasOfferCatalog?.itemListElement ?? [];
    expect(offers.length).toBeGreaterThanOrEqual(3);
  });
});

const SUBPAGES = [
  { file: 'solutions.html', crumb: 'Solar Solutions' },
  { file: 'benefits.html', crumb: 'Solar Savings Calculator' },
  { file: 'faq.html', crumb: 'About Us' },
  { file: 'team.html', crumb: 'Our Team' }
];

describe.each(SUBPAGES)('Breadcrumbs — $file', ({ file, crumb }) => {
  it('exposes a valid BreadcrumbList ending on this page', () => {
    const doc = parse(readRepoFile(file));
    const crumbs = [...doc.querySelectorAll('script[type="application/ld+json"]')]
      .map((b) => JSON.parse(b.textContent))
      .find((j) => j['@type'] === 'BreadcrumbList');
    expect(crumbs).toBeTruthy();
    const items = crumbs.itemListElement;
    expect(items[0].name).toBe('Home');
    expect(items[items.length - 1].name).toBe(crumb);
    expect(items[items.length - 1].item).toBe(`${DOMAIN}/${file}`);
  });
});

describe('FAQ structured data (faq.html)', () => {
  const doc = parse(readRepoFile('faq.html'));
  const faqBlock = [...doc.querySelectorAll('script[type="application/ld+json"]')]
    .map((b) => JSON.parse(b.textContent))
    .find((j) => j['@type'] === 'FAQPage');

  it('exposes a FAQPage with well-formed questions', () => {
    expect(faqBlock).toBeTruthy();
    expect(faqBlock.mainEntity.length).toBeGreaterThanOrEqual(5);
    for (const q of faqBlock.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.name.length).toBeGreaterThan(5);
      expect(q.acceptedAnswer?.text?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it('matches the number of on-page accordion questions', () => {
    const visible = doc.querySelectorAll('.faq-toggle').length;
    expect(visible).toBe(faqBlock.mainEntity.length);
  });
});

describe('robots.txt', () => {
  const txt = readRepoFile('robots.txt');
  it('allows crawling and references the sitemap', () => {
    expect(txt).toMatch(/User-agent:\s*\*/i);
    expect(txt).toMatch(/Allow:\s*\//i);
    expect(txt).toMatch(new RegExp(`Sitemap:\\s*${DOMAIN}/sitemap\\.xml`, 'i'));
  });
});

describe('sitemap.xml', () => {
  const xml = readRepoFile('sitemap.xml');
  const doc = new window.DOMParser().parseFromString(xml, 'application/xml');
  const locs = [...doc.getElementsByTagName('loc')].map((n) => n.textContent);

  it('is well-formed XML', () => {
    expect(doc.getElementsByTagName('parsererror').length).toBe(0);
    expect(locs.length).toBeGreaterThan(0);
  });

  it('lists every page on the canonical HTTPS domain', () => {
    for (const loc of locs) {
      expect(loc.startsWith(`${DOMAIN}/`)).toBe(true);
    }
    expect(locs).toContain(`${DOMAIN}/`);
    for (const page of ALL_PAGES) {
      if (page === 'index.html') continue;
      expect(locs).toContain(`${DOMAIN}/${page}`);
    }
  });
});

describe('CNAME', () => {
  it('pins the custom domain', () => {
    expect(readRepoFile('CNAME').trim()).toBe('solaride.in');
  });
});

describe.each(ALL_PAGES)('Crawlability — %s', (file) => {
  it('is present and non-trivial', () => {
    expect(existsSync(resolve(repoRoot, file))).toBe(true);
    expect(readRepoFile(file).length).toBeGreaterThan(500);
  });
});
