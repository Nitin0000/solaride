/**
 * SOLARIDE pure calculation helpers.
 *
 * Framework-free UMD-ish module: attaches to the global (window in the browser,
 * globalThis under test) so it can be loaded via <script> and unit-tested
 * without a build step.
 */
(function (global) {
  'use strict';

  /** Rounds a number to one decimal place. */
  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  /**
   * Environmental impact of a rooftop solar system (Tree-to-Energy calculator).
   * @param {number} systemSize - System size in kW.
   * @param {number} sunlightHours - Average daily sunlight hours.
   * @returns {{co2Offset: number, treeEquivalent: number, energyProduced: number}}
   */
  function treeToEnergy(systemSize, sunlightHours) {
    const size = Number(systemSize) || 0;
    const sun = Number(sunlightHours) || 0;
    const sunFactor = sun / 5;
    return {
      co2Offset: round1(size * 0.7 * sunFactor),
      treeEquivalent: Math.round(size * 20 * sunFactor),
      energyProduced: Math.round(size * 1400 * sunFactor)
    };
  }

  /**
   * Financial + environmental projection for a rooftop solar system.
   * @param {{monthlyBill: number, roofArea: number, location?: string}} input
   * @returns {object} Full breakdown used by the savings calculator UI.
   */
  function solarSavings(input) {
    const monthlyBill = Number(input && input.monthlyBill) || 0;
    const roofArea = Number(input && input.roofArea) || 0;
    const location = (input && input.location) || 'medium';

    const systemSize = Math.max(
      0,
      Math.min(Math.round(monthlyBill / 600), Math.floor(roofArea / 10))
    );

    let locationFactor = 1;
    if (location === 'high') locationFactor = 1.2;
    if (location === 'low') locationFactor = 0.8;

    const investmentPerKw = 60000;
    const electricityRate = 8;

    const investment = systemSize * investmentPerKw;
    const monthlyGeneration = systemSize * 120 * locationFactor;
    const monthlySavings = monthlyGeneration * electricityRate;
    const annualSavings = monthlySavings * 12;
    const lifetimeSavings = annualSavings * 30;
    const paybackPeriod = annualSavings > 0 ? round1(investment / annualSavings) : 0;
    const roi = investment > 0 ? Math.round((lifetimeSavings / investment) * 100) : 0;

    const co2Reduction = round1(systemSize * 0.7);
    const treeEquivalent = Math.round(co2Reduction * 28.5);

    return {
      systemSize,
      locationFactor,
      investment,
      monthlyGeneration,
      monthlySavings,
      annualSavings,
      lifetimeSavings,
      paybackPeriod,
      roi,
      co2Reduction,
      lifetimeCo2: round1(co2Reduction * 30),
      treeEquivalent,
      panelCount: systemSize * 3,
      roofAreaUsed: systemSize * 6,
      energyProductionAnnual: monthlyGeneration * 12,
      footprintReduction: Math.min(90, Math.round(systemSize * 6))
    };
  }

  const SolarideCalc = { round1, treeToEnergy, solarSavings };

  global.SolarideCalc = SolarideCalc;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarideCalc;
  }
})(typeof window !== 'undefined' ? window : globalThis);
