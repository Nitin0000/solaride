import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(here, '..', '..');

/** Reads a repo-relative file as UTF-8 text. */
export function readRepoFile(relPath) {
  return readFileSync(resolve(repoRoot, relPath), 'utf8');
}

/**
 * Evaluates a plain browser script in the current (jsdom) global scope so its
 * top-level `window.*` assignments and DOMContentLoaded listeners take effect.
 * Re-runnable, which lets each test start from a fresh DOM.
 */
export function loadScript(relPath) {
  const code = readRepoFile(relPath);
  // Indirect eval => runs in global scope, where jsdom's window/document live.
  (0, eval)(code);
}

/** Fires DOMContentLoaded so scripts that defer their init wire up the DOM. */
export function fireDomReady() {
  document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
}
