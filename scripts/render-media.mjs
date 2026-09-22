import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new Map([
  ['/three.module.js', 'node_modules/three/build/three.module.js'],
  ['/three.core.js', 'node_modules/three/build/three.core.js'],
  ['/scene.js', 'scripts/solar-scene.js']
]);
const server = createServer(async (request, response) => {
  try {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><html><head><style>html,body{margin:0;background:#e8eee8}canvas{display:block}</style></head><body><script type="module" src="/scene.js"></script></body></html>');
    } else if (assets.has(request.url)) {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(resolve(root, assets.get(request.url))));
    } else {
      response.writeHead(404).end();
    }
  } catch {
    response.writeHead(500).end();
  }
});

await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => typeof window.renderSolarScene === 'function');
  await mkdir(resolve(root, 'assets/images/renders'), { recursive: true });
  for (const kind of ['home', 'commercial', 'farm', 'detail']) {
    await page.evaluate((kind) => window.renderSolarScene(kind), kind);
    await page.waitForFunction((kind) => window.sceneReady === kind, kind);
    const pixels = await page.locator('canvas').evaluate((canvas) => {
      const context = canvas.getContext('webgl2');
      const sample = new Uint8Array(4);
      context.readPixels(900, 600, 1, 1, context.RGBA, context.UNSIGNED_BYTE, sample);
      return [...sample];
    });
    if (pixels[3] === 0 || pixels.slice(0, 3).every((value) => value === 0)) throw new Error(`Blank ${kind} render`);
    await page.locator('canvas').screenshot({ path: resolve(root, `assets/images/renders/solar-${kind}.png`) });
    console.log(`Rendered solar-${kind}.png; center RGBA ${pixels.join(',')}`);
  }
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}