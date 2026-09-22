import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '_site');
const images = [
  'iconLogo.png', 'editorial/solar-horizon.webp', 'editorial/rooftop-life.webp', 'crowdWork.jpg',
  'licensed/agrivoltaic-canopy.webp',
  'installations/commercial-rooftop.png',
  'inspirationPic.jpg', 'impactPic.jpg', 'People/pankaj.jpeg',
  'People/vanshul.png', 'People/priyanka.png', 'People/praveen.png',
  { source: 'WhatsApp Image 2026-06-06 at 12.20.35.jpeg', stem: 'installations/installation-canopy' },
  { source: 'WhatsApp Image 2026-06-06 at 12.20.38.jpeg', stem: 'installations/installation-frame' },
  { source: 'WhatsApp Image 2026-06-06 at 12.20.40.jpeg', stem: 'installations/installation-team' }
];

execFileSync(process.execPath, [
  resolve(root, 'node_modules/tailwindcss/lib/cli.js'),
  '-c', 'tailwind.config.cjs', '-i', 'assets/css/tailwind.css',
  '-o', 'assets/css/utilities.css', '--minify'
], { cwd: root, stdio: 'inherit' });

await rm(resolve(root, 'assets/images/optimized'), { recursive: true, force: true });
for (const image of images) {
  const source = resolve(root, 'assets/images', typeof image === 'string' ? image : image.source);
  const stem = typeof image === 'string' ? image.replace(/\.[^.]+$/, '') : image.stem;
  const widths = image === 'iconLogo.png' ? [240, 480] : [480, 960, 1440];
  for (const width of widths) {
    const target = resolve(root, 'assets/images/optimized', `${stem}-${width}.webp`);
    await mkdir(dirname(target), { recursive: true });
    await sharp(source).rotate().resize({ width }).webp({ quality: 80 }).toFile(target);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(root)) {
  if (entry.endsWith('.html') || ['CNAME', 'robots.txt', 'sitemap.xml'].includes(entry)) {
    await cp(resolve(root, entry), resolve(output, entry));
  }
}
await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
console.log('Built static CSS, responsive images, and public site in _site/.');