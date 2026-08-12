import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

beforeAll(() => {
  // Load the browser scripts once so their DOMContentLoaded handlers don't
  // accumulate (which would double-bind click handlers across tests).
  loadScript('assets/js/utils.js');
  loadScript('assets/js/modals.js');
  loadScript('assets/js/calc.js');
  loadScript('assets/js/calculator.js');
});

beforeEach(() => {
  // jsdom implements neither of these; stub so the handlers run cleanly.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal('URL', Object.assign(window.URL, {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn()
  }));

  document.body.innerHTML = `
    <div id="savings-calculator">
      <input type="number" id="monthly-bill" value="3000" />
      <input type="number" id="roof-area" value="500" />
      <select id="location"><option value="medium" selected>Medium</option><option value="high">High</option></select>
      <button id="calculate-button" type="button">Calculate</button>
      <div id="results-container" class="hidden">
        <span id="savings-system-size">0</span>
        <span id="investment">0</span>
        <span id="monthly-savings">0</span>
        <span id="annual-savings">0</span>
        <span id="payback-period">0</span>
        <span id="co2-reduction">0</span>
        <span id="savings-tree-equivalent">0</span>
        <button id="detailed-report-button" type="button">Report</button>
      </div>
    </div>
    <div id="report-modal" class="hidden" aria-hidden="true">
      <button id="close-report-modal">x</button>
      <span id="modal-system-size">0</span><span id="modal-panel-count">0</span>
      <span id="modal-roof-area">0</span><span id="modal-energy-production">0</span>
      <span id="modal-investment">0</span><span id="modal-monthly-savings">0</span>
      <span id="modal-annual-savings">0</span><span id="modal-lifetime-savings">0</span>
      <span id="modal-payback-period">0</span><span id="modal-roi">0</span>
      <span id="modal-co2-reduction">0</span><span id="modal-lifetime-co2">0</span>
      <span id="modal-tree-equivalent">0</span><span id="modal-footprint-reduction">0</span>
      <button id="download-report" type="button">Download</button>
      <button id="contact-from-modal" type="button">Contact</button>
    </div>`;

  fireDomReady();
});

describe('Solar Savings calculator (DOM)', () => {
  it('reveals and fills the results panel on Calculate', () => {
    document.getElementById('calculate-button').click();
    expect(document.getElementById('results-container').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('savings-system-size').textContent).toBe('5');
    expect(document.getElementById('investment').textContent).toBe('3,00,000');
    expect(document.getElementById('monthly-savings').textContent).toBe('4,800');
    expect(document.getElementById('annual-savings').textContent).toBe('57,600');
    expect(document.getElementById('payback-period').textContent).toBe('5.2');
    expect(document.getElementById('co2-reduction').textContent).toBe('3.5');
    expect(document.getElementById('savings-tree-equivalent').textContent).toBe('100');
  });

  it('does not collide with the Tree-to-Energy calculator IDs', () => {
    // The savings calculator must not write to bare `system-size`/`tree-equivalent`.
    expect(document.getElementById('savings-system-size')).toBeTruthy();
    expect(document.querySelector('#results-container #system-size')).toBeNull();
  });

  it('opens the detailed report modal with computed figures', () => {
    document.getElementById('calculate-button').click();
    document.getElementById('detailed-report-button').click();
    expect(document.getElementById('report-modal').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('modal-investment').textContent).toBe('3,00,000');
    expect(document.getElementById('modal-roi').textContent).toBe('576');
    expect(document.getElementById('modal-tree-equivalent').textContent).toBe('100');
  });

  it('generates a downloadable estimate after calculating', () => {
    document.getElementById('calculate-button').click();
    document.getElementById('download-report').click();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = URL.createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('does not download before any calculation', () => {
    document.getElementById('download-report').click();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
