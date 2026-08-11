import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

beforeEach(() => {
  // Complete any animation on the first frame so assertions are deterministic.
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb(performance.now() + 10000);
    return 1;
  });

  document.body.innerHTML = `
    <div id="solar-benefits">
      <input type="range" id="system-size" min="1" max="10" value="5" />
      <span id="system-size-display">5</span>
      <input type="range" id="sunlight-hours" min="3" max="7" value="5" />
      <span id="sunlight-hours-display">5</span>
      <button id="calculate-btn" type="button">Calculate</button>
      <span id="co2-offset">0</span>
      <span id="tree-equivalent">0</span>
      <span id="energy-produced">0</span>
    </div>`;
  loadScript('assets/js/calc.js');
  loadScript('assets/js/calculator.js');
  fireDomReady();
});

describe('Tree-to-Energy calculator (DOM)', () => {
  it('updates the slider display on input', () => {
    const slider = document.getElementById('system-size');
    slider.value = '8';
    slider.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(document.getElementById('system-size-display').textContent).toBe('8');
  });

  it('computes impact figures on Calculate for defaults (5 kW, 5 h)', () => {
    document.getElementById('calculate-btn').click();
    expect(document.getElementById('co2-offset').textContent).toBe('3.5');
    expect(document.getElementById('tree-equivalent').textContent).toBe('100');
    expect(document.getElementById('energy-produced').textContent).toBe('7,000');
  });

  it('recomputes when inputs change', () => {
    document.getElementById('system-size').value = '10';
    document.getElementById('sunlight-hours').value = '7';
    document.getElementById('calculate-btn').click();
    // 10 kW @ 7h => co2 = 10*0.7*1.4 = 9.8, energy = 10*1400*1.4 = 19600
    expect(document.getElementById('co2-offset').textContent).toBe('9.8');
    expect(document.getElementById('energy-produced').textContent).toBe('19,600');
  });
});
