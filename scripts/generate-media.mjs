import { mkdir, readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const specification = JSON.parse(await readFile(resolve(root, 'scripts/media-prompts.json'), 'utf8'));
const base = 'https://black-forest-labs-flux-1-schnell.hf.space';
const selected = process.argv.slice(2);
const images = specification.images.filter((image) => !selected.length || selected.includes(image.name));
if (!images.length) throw new Error('No matching image names in scripts/media-prompts.json');
await mkdir(resolve(root, 'assets/images/editorial'), { recursive: true });

async function generate(image) {
  const response = await fetch(`${base}/gradio_api/call/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [image.prompt, image.seed, false, image.width, image.height, 4] }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Generation submission failed: HTTP ${response.status}`);
  const { event_id: eventId } = await response.json();
  if (!eventId) throw new Error('Provider did not return a generation event');
  const stream = await fetch(`${base}/gradio_api/call/infer/${encodeURIComponent(eventId)}`, {
    signal: AbortSignal.timeout(120000)
  });
  if (!stream.ok) throw new Error(`Generation stream failed: HTTP ${stream.status}`);
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of stream.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const lines = frame.split('\n');
      const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
      const payload = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
      if (event === 'error') throw new Error(`Provider could not generate ${image.name}: ${payload}`);
      if (event === 'complete') {
        const [file] = JSON.parse(payload);
        const url = new URL(file.url);
        if (url.origin !== base || !url.pathname.startsWith('/gradio_api/file=')) throw new Error('Unexpected generated image URL');
        const download = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!download.ok) throw new Error(`Image download failed: HTTP ${download.status}`);
        const bytes = Buffer.from(await download.arrayBuffer());
        const metadata = await sharp(bytes).metadata();
        if (metadata.width !== image.width || metadata.height !== image.height) throw new Error('Unexpected image dimensions');
        return bytes;
      }
    }
  }
  throw new Error('Generation stream ended without an image');
}

for (const image of images) {
  const target = resolve(root, `assets/images/editorial/${image.name}.webp`);
  try {
    await access(target);
    console.log(`Keeping existing ${image.name}.webp`);
    continue;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  console.log(`Generating ${image.name} with ${specification.model}...`);
  const bytes = await generate(image);
  await sharp(bytes).webp({ quality: 95 }).toFile(target);
  console.log(`Saved ${image.name}.webp (${image.width} x ${image.height})`);
}