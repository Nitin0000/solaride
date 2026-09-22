import { describe, it, expect } from 'vitest';
import { readRepoFile } from './helpers/dom.mjs';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './helpers/dom.mjs';

const DOMAIN = 'https://solaride.in';

const CONTENT_PAGES = [
  { file: 'index.html', canonical: `${DOMAIN}/` },
  { file: 'solutions.html', canonical: `${DOMAIN}/solutions.html` },
  { file: 'benefits.html', canonical: `${DOMAIN}/benefits.html` },
  { file: 'faq.html', canonical: `${DOMAIN}/faq.html` },
  { file: 'team.html', canonical: `${DOMAIN}/team.html` },
  { file: 'rooftop-solar-guide.html', canonical: `${DOMAIN}/rooftop-solar-guide.html` },
  { file: 'solar-panel-installation-mohali.html', canonical: `${DOMAIN}/solar-panel-installation-mohali.html` },
  { file: 'solar-panel-installation-hisar.html', canonical: `${DOMAIN}/solar-panel-installation-hisar.html` }
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

  it('ships static CSS instead of runtime styling or unused chart libraries', () => {
    expect(doc.querySelector('link[href="assets/css/utilities.css"]')).not.toBeNull();
    expect(readRepoFile(file)).not.toMatch(/cdn\.tailwindcss\.com|apexcharts|npm\/chart\.js/);
    expect(statSync(resolve(repoRoot, 'assets/css/utilities.css')).size).toBeLessThan(50000);
  });

  it('ships local assets and responsive, dimensioned images', () => {
    for (const node of doc.querySelectorAll('script[src], link[rel="stylesheet"][href], img[src]')) {
      const url = new URL(node.getAttribute('src') ?? node.getAttribute('href'), canonical);
      if (url.origin === DOMAIN) {
        expect(existsSync(resolve(repoRoot, '_site', decodeURIComponent(url.pathname.slice(1)))), url.href).toBe(true);
      }
    }
    for (const image of doc.querySelectorAll('img')) {
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
      expect(image.getAttribute('alt')).toBeTruthy();
      expect(image.getAttribute('srcset')).toBeTruthy();
      for (const candidate of image.getAttribute('srcset').split(',')) {
        const [source] = candidate.trim().split(/\s+/);
        expect(existsSync(resolve(repoRoot, '_site', source)), source).toBe(true);
      }
    }
  });

  it('links to existing local pages', () => {
    for (const link of doc.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), canonical);
      if (url.origin !== DOMAIN) continue;
      const target = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
      expect(existsSync(resolve(repoRoot, '_site', target)), `${file}: ${url.href}`).toBe(true);
    }
  });
});

describe('Search quality and deployment', () => {
  it.each([...CONTENT_PAGES.map(({ file }) => file), '404.html', 'privacy.html', 'data-deletion.html'])('declares the light-only design before rendering %s', (file) => {
    const doc = parse(readRepoFile(file));
    expect(doc.querySelector('meta[name="color-scheme"]').content).toBe('only light');
    expect(doc.querySelector('meta[name="theme-color"][media*="dark"]')).toBeNull();
  });

  it.each(CONTENT_PAGES)('states North India coverage in the header of $file', ({ file }) => {
    const doc = parse(readRepoFile(file));
    expect(doc.querySelector('header').textContent).toContain('Serving all of North India');
  });

  it('distinguishes office locations from regional service coverage', () => {
    const doc = parse(readRepoFile('index.html'));
    const coverage = doc.querySelector('#areas');
    expect(coverage.querySelector('h2').textContent).toBe('Serving All of North India');
    expect([...coverage.querySelectorAll('h3')].map((heading) => heading.textContent)).toEqual(['Mohali Office', 'Hisar Office']);
    expect(coverage.textContent).toContain('not the limits of our service area');
    expect(doc.querySelector('#hero').textContent).not.toContain('From Mohali to Hisar');
  });

  it.each(['mohali', 'hisar'])('retains North India coverage on the %s office page', (city) => {
    const doc = parse(readRepoFile(`solar-panel-installation-${city}.html`));
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    const office = graph.find((node) => node['@type'] === 'LocalBusiness');
    expect(office.areaServed).toContainEqual({ '@type': 'Place', name: 'North India' });
    expect(doc.body.textContent).toContain('our coverage is not limited to this list');
  });

  it('matches the regional coverage FAQ to its structured answer', () => {
    const doc = parse(readRepoFile('faq.html'));
    const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => JSON.parse(script.textContent))
      .find((node) => node['@type'] === 'FAQPage');
    const answer = schema.mainEntity.find((entry) => entry.name === 'Which areas do you cover?');
    expect(answer.acceptedAnswer.text).toBe(doc.querySelector('#faq-10').textContent.trim());
    expect(answer.acceptedAnswer.text).toContain('We serve all of North India.');
  });

  it('uses the supplied rooftop photograph for the commercial offering', () => {
    const doc = parse(readRepoFile('solutions.html'));
    const heading = [...doc.querySelectorAll('h3')].find((node) => node.textContent.trim() === 'Commercial & Industrial');
    const image = heading.parentElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('assets/images/optimized/installations/commercial-rooftop-960.webp');
    expect(image.getAttribute('width')).toBe('1600');
    expect(image.getAttribute('height')).toBe('1200');
    expect(image.classList.contains('solar-art--commercial')).toBe(true);
    expect(image.alt).toContain('blue metal roof');
    expect(existsSync(resolve(repoRoot, 'assets/images/installations/commercial-rooftop.png'))).toBe(true);
  });

  it('does not reuse rooftop imagery for the agricultural solar offering', () => {
    const doc = parse(readRepoFile('solutions.html'));
    const heading = [...doc.querySelectorAll('h3')].find((node) => node.textContent.trim() === 'Agricultural Solar');
    expect(heading).toBeTruthy();
    const offering = heading.parentElement;
    expect(offering.querySelector('.fa-seedling')).toBeNull();
    expect(offering.querySelectorAll('img')).toHaveLength(1);
    expect(offering.querySelector('img').getAttribute('src')).toBe('assets/images/optimized/licensed/agricultural-solar-irrigation-960.webp');
    expect(offering.querySelector('figcaption').textContent).toContain('SMMIMAGES');
    expect(offering.querySelector('a[href="https://creativecommons.org/licenses/by-sa/4.0/"]')).not.toBeNull();
    expect(statSync(resolve(repoRoot, offering.querySelector('img').getAttribute('src'))).size).toBeLessThan(250000);
    for (const image of offering.querySelectorAll('img')) {
      expect(image.getAttribute('src')).not.toMatch(/solar-horizon|rooftop-life|installation-canopy|installation-frame|commercial-rooftop/);
      expect(image.alt).toMatch(/irrigation|agricultur|farm|crop/i);
    }
  });

  it.each(CONTENT_PAGES)('uses editorial concepts or existing photography in $file', ({ file }) => {
    const html = readRepoFile(file);
    const doc = parse(html);
    expect(html).not.toMatch(/solarInstall|greenEnergy|\/renders\//);
    const art = [...doc.querySelectorAll('img[src*="/editorial/"], img[src*="/installations/"], img[src*="/licensed/"]')];
    expect(art.length).toBeGreaterThan(0);
    for (const image of art) {
      if (image.getAttribute('src').includes('/editorial/')) {
        expect(image.alt).toMatch(/AI-generated/i);
        expect(image.closest('figure').querySelector('figcaption')).toBeNull();
      } else {
        expect(image.alt).not.toMatch(/AI-generated|illustration/i);
      }
      expect(image.hasAttribute('onerror')).toBe(false);
      expect(statSync(resolve(repoRoot, image.getAttribute('src'))).size).toBeLessThan(250000);
    }
    expect([...doc.querySelectorAll('script[src]')].some((script) => /three|solar-scene/.test(script.src))).toBe(false);
  });

  it('records provenance for each published AI image', () => {
    const specification = JSON.parse(readRepoFile('scripts/media-prompts.json'));
    expect(specification.model).toBe('black-forest-labs/FLUX.1-schnell');
    expect(specification.license).toBe('Apache-2.0');
    for (const file of CONTENT_PAGES) {
      const doc = parse(readRepoFile(file.file));
      for (const image of doc.querySelectorAll('img[src*="/editorial/"]')) {
        const name = image.getAttribute('src').split('/').pop().replace(/-\d+\.webp$/, '');
        const entry = specification.images.find((item) => item.name === name);
        expect(entry?.prompt).toBeTruthy();
        expect(existsSync(resolve(repoRoot, `assets/images/editorial/${name}.webp`))).toBe(true);
      }
    }
  });

  it('preserves the real journey and team photographs in their existing pages', () => {
    for (const file of ['index.html', 'faq.html']) {
      const doc = parse(readRepoFile(file));
      for (const photo of ['crowdWork', 'inspirationPic', 'impactPic']) {
        expect(doc.querySelector(`img[src="assets/images/optimized/${photo}-960.webp"]`)).not.toBeNull();
        expect(existsSync(resolve(repoRoot, `assets/images/${photo}.jpg`))).toBe(true);
      }
    }
    const team = parse(readRepoFile('team.html'));
    for (const person of ['pankaj', 'vanshul', 'priyanka', 'praveen']) {
      expect(team.querySelector(`img[src="assets/images/optimized/People/${person}-960.webp"]`)).not.toBeNull();
      expect(existsSync(resolve(repoRoot, `assets/images/People/${person}.${person === 'pankaj' ? 'jpeg' : 'png'}`))).toBe(true);
    }
  });

  it.each(CONTENT_PAGES)('avoids unsupported price and savings promises in $file', ({ file }) => {
    expect(parse(readRepoFile(file)).body.textContent).not.toMatch(/98%|55,000|65,000|3-4 Year Payback|Zero-Carbon Business ESG/);
  });

  it.each(['mohali', 'hisar'])('keeps the %s price answer consistent with structured data', (city) => {
    const doc = parse(readRepoFile(`solar-panel-installation-${city}.html`));
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    const priceAnswer = graph.find((node) => node['@type'] === 'FAQPage').mainEntity[0];
    const question = doc.querySelector('.faq-toggle');
    expect(priceAnswer.name).toBe(question.textContent.trim());
    expect(priceAnswer.acceptedAnswer.text).toBe(doc.getElementById(question.getAttribute('aria-controls')).textContent.trim());
    expect(priceAnswer.acceptedAnswer.text).toContain('subject to approval');
  });

  it('describes the savings tool accurately without unsupported financial promises', () => {
    const doc = parse(readRepoFile('benefits.html'));
    expect(doc.querySelector('h1').textContent).toContain('Solar Savings Calculator');
    expect(doc.querySelector('#savings-calculator').textContent).toContain('not a quotation or savings guarantee');
    expect(doc.querySelector('#savings-calculator a[href="rooftop-solar-guide.html"]')).not.toBeNull();
    expect(doc.body.textContent).not.toMatch(/98%|Increases home value by/);
  });

  it('has unique titles and descriptions across content pages', () => {
    const docs = CONTENT_PAGES.map(({ file }) => parse(readRepoFile(file)));
    expect(new Set(docs.map((doc) => doc.title)).size).toBe(docs.length);
    expect(new Set(docs.map((doc) => meta(doc, 'meta[name="description"]'))).size).toBe(docs.length);
  });

  it('keeps search and AI search crawlers unblocked', () => {
    const rules = readRepoFile('robots.txt').split('\n').map((line) => line.split('#')[0].trim()).filter(Boolean);
    expect(rules).toContain('User-agent: *');
    expect(rules).toContain('Allow: /');
    expect(rules.some((line) => /^Disallow:\s*\S/i.test(line))).toBe(false);
  });

  it('does not publish build tools, dependencies or internal documentation', () => {
    for (const privatePath of ['node_modules', 'tests', 'docs', 'scripts', 'package.json', '.git', '.github']) {
      expect(existsSync(resolve(repoRoot, '_site', privatePath))).toBe(false);
    }
    expect(readRepoFile('_site/robots.txt')).toBe(readRepoFile('robots.txt'));
    expect(readRepoFile('_site/sitemap.xml')).toBe(readRepoFile('sitemap.xml'));
  });

  it('connects the sourced guide to visible authorship, dates and internal links', () => {
    const doc = parse(readRepoFile('rooftop-solar-guide.html'));
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    const article = graph.find((node) => node['@type'] === 'Article');
    expect(article.headline).toBe(doc.querySelector('h1').textContent);
    expect(article.dateModified).toBe(doc.querySelector('time').getAttribute('datetime'));
    expect(doc.querySelector('article').textContent).toContain(article.author.name);
    expect(doc.querySelector('a[href="https://pmsuryaghar.gov.in/"]')).not.toBeNull();
    expect(doc.querySelector('a[href*="PRID=2010130"]')).not.toBeNull();
    for (const link of doc.querySelectorAll('a[href^="#"]')) {
      expect(doc.getElementById(link.getAttribute('href').slice(1))).not.toBeNull();
    }
    for (const file of ['index.html', 'faq.html', 'solutions.html', 'benefits.html', 'solar-panel-installation-mohali.html', 'solar-panel-installation-hisar.html']) {
      expect(parse(readRepoFile(file)).querySelector('a[href="rooftop-solar-guide.html"]')).not.toBeNull();
    }
  });
});

describe('Structured data (index.html)', () => {
  const doc = parse(readRepoFile('index.html'));
  const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')];

  it('connects the homepage to the website and business entity', () => {
    const graph = blocks.flatMap((block) => JSON.parse(block.textContent)['@graph'] ?? []);
    const page = graph.find((node) => node['@type'] === 'WebPage');
    expect(page.url).toBe(`${DOMAIN}/`);
    expect(page.isPartOf['@id']).toBe(`${DOMAIN}/#website`);
    expect(page.about['@id']).toBe(`${DOMAIN}/#organization`);
  });

  it.each(['mohali', 'hisar'])('keeps the %s office consistent with its service page', (city) => {
    const graph = blocks.flatMap((block) => JSON.parse(block.textContent)['@graph'] ?? []);
    const office = graph.find((node) => node['@id'] === `${DOMAIN}/#${city}`);
    const localDoc = parse(readRepoFile(`solar-panel-installation-${city}.html`));
    const localGraph = [...localDoc.querySelectorAll('script[type="application/ld+json"]')]
      .flatMap((block) => {
        const data = JSON.parse(block.textContent);
        return data['@graph'] ?? [data];
      });
    const localOffice = localGraph.find((node) => node['@id'] === office['@id']);
    expect(office.url).toBe(`${DOMAIN}/solar-panel-installation-${city}.html`);
    expect(office.telephone).toBe(localOffice.telephone);
    expect(office.name).toBe(localOffice.name);
    expect(office.address).toEqual(localOffice.address);
    const telephone = office.telephone.replace(/[^+\d]/g, '');
    expect(doc.querySelector(`a[href="tel:${telephone}"]`)).not.toBeNull();
    expect(localDoc.querySelector(`a[href="tel:${telephone}"]`)).not.toBeNull();
  });

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

  it.each(['faq-1', 'faq-2', 'faq-4'])('matches the qualified visible answer in %s', (answerId) => {
    const question = doc.querySelector(`[aria-controls="${answerId}"]`).textContent.trim();
    const answer = faqBlock.mainEntity.find((entry) => entry.name === question);
    expect(answer.acceptedAnswer.text).toBe(doc.getElementById(answerId).textContent.trim());
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
