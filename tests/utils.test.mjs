import { describe, it, expect, beforeAll, vi } from 'vitest';
import { loadScript } from './helpers/dom.mjs';

beforeAll(() => {
  loadScript('assets/js/utils.js');
});

describe('SolarideUtils.formatCurrency', () => {
  it('formats INR with no fractional digits', () => {
    const { formatCurrency } = window.SolarideUtils;
    // Non-breaking space / grouping is locale-driven; assert on stable parts.
    const out = formatCurrency(1234567);
    expect(out).toContain('₹');
    expect(out).toContain('12,34,567'); // Indian digit grouping
    expect(out).not.toContain('.');
  });

  it('rounds down fractional rupees', () => {
    const { formatCurrency } = window.SolarideUtils;
    expect(formatCurrency(99.99)).toContain('100');
  });
});

describe('SolarideUtils.animateValue', () => {
  it('ends on the target value and uses the formatter', () => {
    const { animateValue } = window.SolarideUtils;
    const el = document.createElement('div');

    // Drive rAF synchronously: first frame, then a frame one full duration later.
    let frame = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb(100 + frame++ * 1000);
      return frame;
    });

    animateValue(el, 0, 500, 1000, (v) => `${v} kWh`);
    expect(el.textContent).toBe('500 kWh');
  });

  it('renders raw numbers when no formatter is given', () => {
    const { animateValue } = window.SolarideUtils;
    const el = document.createElement('div');
    let frame = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb(100 + frame++ * 1000);
      return frame;
    });
    animateValue(el, 0, 42, 1000);
    expect(el.textContent).toBe('42');
  });
});

describe('SolarideUtils.trapFocus', () => {
  it('focuses the first focusable element', () => {
    const { trapFocus } = window.SolarideUtils;
    document.body.innerHTML = `
      <div id="m">
        <button id="a">A</button>
        <a href="#" id="b">B</a>
      </div>`;
    const modal = document.getElementById('m');
    trapFocus(modal);
    expect(document.activeElement.id).toBe('a');
  });

  it('wraps focus from last to first on Tab', () => {
    const { trapFocus } = window.SolarideUtils;
    document.body.innerHTML = `
      <div id="m2">
        <button id="first">A</button>
        <button id="last">B</button>
      </div>`;
    const modal = document.getElementById('m2');
    trapFocus(modal);
    document.getElementById('last').focus();
    modal.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement.id).toBe('first');
  });
});
