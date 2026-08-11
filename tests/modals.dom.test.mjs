import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="story-modal" class="hidden" aria-hidden="true">
      <button id="close-story-modal">close</button>
      <a href="#link">link</a>
      <button>ok</button>
    </div>
    <button id="read-more-btn">Read story</button>`;
  loadScript('assets/js/utils.js');
  loadScript('assets/js/modals.js');
  fireDomReady();
});

describe('Modals (DOM)', () => {
  it('openModal reveals the modal and locks scroll', () => {
    window.openModal('story-modal');
    const modal = document.getElementById('story-modal');
    expect(modal.classList.contains('hidden')).toBe(false);
    expect(modal.classList.contains('flex')).toBe(true);
    expect(modal.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closeModal hides the modal and restores scroll', () => {
    window.openModal('story-modal');
    window.closeModal('story-modal');
    const modal = document.getElementById('story-modal');
    expect(modal.classList.contains('hidden')).toBe(true);
    expect(modal.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  it('the "read more" trigger opens the story modal', () => {
    document.getElementById('read-more-btn').click();
    expect(document.getElementById('story-modal').classList.contains('hidden')).toBe(false);
  });

  it('Escape closes an open modal', () => {
    window.openModal('story-modal');
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.getElementById('story-modal').classList.contains('hidden')).toBe(true);
  });

  it('clicking the close button closes the modal', () => {
    window.openModal('story-modal');
    document.getElementById('close-story-modal').click();
    expect(document.getElementById('story-modal').classList.contains('hidden')).toBe(true);
  });
});
