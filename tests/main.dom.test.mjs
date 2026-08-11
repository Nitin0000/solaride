import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

beforeEach(() => {
  document.body.innerHTML = `
    <header id="header">
      <button id="mobile-menu-button" aria-expanded="false">menu</button>
      <div id="mobile-menu" class="hidden">
        <a href="#contact">Contact</a>
      </div>
    </header>
    <button id="back-to-top" class="opacity-0">top</button>
    <section id="contact">Contact</section>`;
  loadScript('assets/js/main.js');
  fireDomReady();
});

describe('Mobile menu (DOM)', () => {
  it('opens on click and reflects state via aria-expanded', () => {
    const btn = document.getElementById('mobile-menu-button');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('mobile-menu').classList.contains('hidden')).toBe(false);
  });

  it('closes again on a second click', () => {
    const btn = document.getElementById('mobile-menu-button');
    btn.click();
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('mobile-menu').classList.contains('hidden')).toBe(true);
  });

  it('closes when a menu link is clicked', () => {
    const btn = document.getElementById('mobile-menu-button');
    btn.click();
    document.querySelector('#mobile-menu a').click();
    expect(document.getElementById('mobile-menu').classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Back-to-top button (DOM)', () => {
  it('becomes visible after scrolling past the threshold', () => {
    Object.defineProperty(window, 'pageYOffset', { value: 500, configurable: true });
    window.dispatchEvent(new window.Event('scroll'));
    const btn = document.getElementById('back-to-top');
    expect(btn.classList.contains('opacity-100')).toBe(true);
    expect(btn.classList.contains('opacity-0')).toBe(false);
  });
});
