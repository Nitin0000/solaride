import { describe, it, expect } from 'vitest';
import SolarideCalc from '../assets/js/calc.js';

const { round1, treeToEnergy, solarSavings } = SolarideCalc;

describe('round1', () => {
  it('rounds to one decimal place', () => {
    expect(round1(3.14159)).toBe(3.1);
    expect(round1(3.15)).toBe(3.2);
    expect(round1(10)).toBe(10);
    expect(round1(0)).toBe(0);
  });
});

describe('treeToEnergy', () => {
  it('matches the documented defaults (5 kW, 5 h)', () => {
    expect(treeToEnergy(5, 5)).toEqual({
      co2Offset: 3.5,
      treeEquivalent: 100,
      energyProduced: 7000
    });
  });

  it('scales linearly with system size', () => {
    const one = treeToEnergy(1, 5);
    const ten = treeToEnergy(10, 5);
    expect(ten.energyProduced).toBe(one.energyProduced * 10);
    expect(ten.treeEquivalent).toBe(one.treeEquivalent * 10);
  });

  it('scales with sunlight hours relative to the 5h baseline', () => {
    expect(treeToEnergy(5, 7).energyProduced).toBeGreaterThan(treeToEnergy(5, 5).energyProduced);
    expect(treeToEnergy(5, 3).energyProduced).toBeLessThan(treeToEnergy(5, 5).energyProduced);
  });

  it('returns one-decimal CO2 and integer trees/energy', () => {
    const r = treeToEnergy(3, 4);
    expect(Number.isInteger(r.treeEquivalent)).toBe(true);
    expect(Number.isInteger(r.energyProduced)).toBe(true);
    expect(round1(r.co2Offset)).toBe(r.co2Offset);
  });

  it('handles zero and non-numeric input safely', () => {
    expect(treeToEnergy(0, 0)).toEqual({ co2Offset: 0, treeEquivalent: 0, energyProduced: 0 });
    expect(treeToEnergy(undefined, null)).toEqual({ co2Offset: 0, treeEquivalent: 0, energyProduced: 0 });
    expect(treeToEnergy('4', '5')).toEqual(treeToEnergy(4, 5));
  });
});

describe('solarSavings', () => {
  it('sizes the system from the smaller of bill and roof constraints', () => {
    // bill/600 = 5, roof/10 = 10 -> min = 5
    expect(solarSavings({ monthlyBill: 3000, roofArea: 100 }).systemSize).toBe(5);
    // bill/600 = 10, roof/10 = 3 -> min = 3
    expect(solarSavings({ monthlyBill: 6000, roofArea: 30 }).systemSize).toBe(3);
  });

  it('applies location factor', () => {
    const base = solarSavings({ monthlyBill: 3000, roofArea: 100, location: 'medium' });
    const high = solarSavings({ monthlyBill: 3000, roofArea: 100, location: 'high' });
    const low = solarSavings({ monthlyBill: 3000, roofArea: 100, location: 'low' });
    expect(high.monthlyGeneration).toBeCloseTo(base.monthlyGeneration * 1.2);
    expect(low.monthlyGeneration).toBeCloseTo(base.monthlyGeneration * 0.8);
  });

  it('computes a consistent financial breakdown', () => {
    const r = solarSavings({ monthlyBill: 3000, roofArea: 100, location: 'medium' });
    expect(r.systemSize).toBe(5);
    expect(r.investment).toBe(300000);
    expect(r.monthlyGeneration).toBe(600);
    expect(r.monthlySavings).toBe(4800);
    expect(r.annualSavings).toBe(57600);
    expect(r.lifetimeSavings).toBe(1728000);
    expect(r.paybackPeriod).toBe(5.2);
    expect(r.roi).toBe(576);
  });

  it('derives environmental + modal figures', () => {
    const r = solarSavings({ monthlyBill: 3000, roofArea: 100 });
    expect(r.co2Reduction).toBe(3.5);
    expect(r.treeEquivalent).toBe(100);
    expect(r.panelCount).toBe(15);
    expect(r.roofAreaUsed).toBe(30);
    expect(r.footprintReduction).toBe(30);
  });

  it('never returns NaN/Infinity for empty input (guards divide-by-zero)', () => {
    const r = solarSavings({});
    expect(r.systemSize).toBe(0);
    expect(r.paybackPeriod).toBe(0);
    expect(r.roi).toBe(0);
    for (const v of Object.values(r)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('caps footprint reduction at 90%', () => {
    const r = solarSavings({ monthlyBill: 600000, roofArea: 100000 });
    expect(r.footprintReduction).toBe(90);
  });

  it('is defensive against negative values', () => {
    const r = solarSavings({ monthlyBill: -1000, roofArea: -50 });
    expect(r.systemSize).toBe(0);
  });
});
