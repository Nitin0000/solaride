import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

beforeAll(() => {
  loadScript('assets/js/faq.js');
});

beforeEach(() => {
  document.body.innerHTML = `
    <div class="space-y-4">
      <button class="faq-toggle" aria-expanded="false" aria-controls="faq-1">
        Q1 <svg class="faq-icon"></svg>
      </button>
      <div id="faq-1" class="hidden"><p>A1</p></div>
      <button class="faq-toggle" aria-expanded="false" aria-controls="faq-2">
        Q2 <svg class="faq-icon"></svg>
      </button>
      <div id="faq-2" class="hidden"><p>A2</p></div>
    </div>`;
  fireDomReady();
});

describe('FAQ accordion (DOM)', () => {
  it('expands an item on click', () => {
    const toggle = document.querySelector('.faq-toggle');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('faq-1').classList.contains('hidden')).toBe(false);
    expect(toggle.querySelector('.faq-icon').classList.contains('rotate-180')).toBe(true);
  });

  it('collapses again on a second click', () => {
    const toggle = document.querySelector('.faq-toggle');
    toggle.click();
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('faq-1').classList.contains('hidden')).toBe(true);
    expect(toggle.querySelector('.faq-icon').classList.contains('rotate-180')).toBe(false);
  });

  it('toggles items independently', () => {
    const [first, second] = document.querySelectorAll('.faq-toggle');
    first.click();
    expect(document.getElementById('faq-1').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('faq-2').classList.contains('hidden')).toBe(true);
    second.click();
    expect(document.getElementById('faq-2').classList.contains('hidden')).toBe(false);
  });
});
