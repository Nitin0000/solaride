document.addEventListener('DOMContentLoaded', () => {
  initTreeToEnergyCalculator();
  initSolarSavingsCalculator();
});

function initTreeToEnergyCalculator() {
  const systemSizeInput = document.getElementById('system-size');
  const systemSizeDisplay = document.getElementById('system-size-display');
  const sunlightHoursInput = document.getElementById('sunlight-hours');
  const sunlightHoursDisplay = document.getElementById('sunlight-hours-display');
  // Use a more specific selector if possible, or ensure ID uniqueness
  const calculateBtn = document.querySelector('#solar-benefits #calculate-btn') || document.getElementById('calculate-btn');
  const co2OffsetDisplay = document.getElementById('co2-offset');
  const treeEquivalentDisplay = document.getElementById('tree-equivalent');
  const energyProducedDisplay = document.getElementById('energy-produced');

  if (!systemSizeInput || !calculateBtn) return;

  // Update display values when sliders change
  systemSizeInput.addEventListener('input', function () {
    if (systemSizeDisplay) systemSizeDisplay.textContent = this.value;
  });

  sunlightHoursInput.addEventListener('input', function () {
    if (sunlightHoursDisplay) sunlightHoursDisplay.textContent = this.value;
  });

  // Calculate impact when button is clicked
  calculateBtn.addEventListener('click', function () {
    const systemSize = parseInt(systemSizeInput.value);
    const sunlightHours = parseInt(sunlightHoursInput.value);

    const impact = window.SolarideCalc.treeToEnergy(systemSize, sunlightHours);

    // Update result displays with animation
    animateNumberChange(co2OffsetDisplay, impact.co2Offset);
    animateNumberChange(treeEquivalentDisplay, impact.treeEquivalent);
    animateNumberChange(energyProducedDisplay, impact.energyProduced);
  });
}

function initSolarSavingsCalculator() {
  const calculateButton = document.getElementById('calculate-button');
  const resultsContainer = document.getElementById('results-container');
  const detailedReportButton = document.getElementById('detailed-report-button');
  const downloadReportButton = document.getElementById('download-report');
  const contactFromModalButton = document.getElementById('contact-from-modal');
  
  if (!calculateButton) return;

  let lastReport = null;

  calculateButton.addEventListener('click', function () {
    const monthlyBillInput = document.getElementById('monthly-bill');
    const roofAreaInput = document.getElementById('roof-area');
    const locationInput = document.getElementById('location');
    
    if (!monthlyBillInput || !roofAreaInput) return;

    const monthlyBill = parseFloat(monthlyBillInput.value);
    const roofArea = parseFloat(roofAreaInput.value);
    const location = locationInput ? locationInput.value : 'medium';

    // Calculate results
    const r = window.SolarideCalc.solarSavings({ monthlyBill, roofArea, location });
    lastReport = { input: { monthlyBill, roofArea, location }, result: r };
    const {
      systemSize, investment, monthlySavings,
      annualSavings, paybackPeriod, co2Reduction, treeEquivalent
    } = r;

    // Results display (IDs prefixed to avoid clashing with the Tree-to-Energy calculator)
    updateText('savings-system-size', systemSize);
    updateText('investment', investment.toLocaleString('en-IN'));
    updateText('monthly-savings', monthlySavings.toLocaleString('en-IN'));
    updateText('annual-savings', annualSavings.toLocaleString('en-IN'));
    updateText('payback-period', paybackPeriod);
    updateText('co2-reduction', co2Reduction);
    updateText('savings-tree-equivalent', treeEquivalent);

    // Update modal values
    updateText('modal-system-size', systemSize);
    updateText('modal-panel-count', r.panelCount);
    updateText('modal-roof-area', r.roofAreaUsed);
    updateText('modal-energy-production', r.energyProductionAnnual.toLocaleString('en-IN'));
    updateText('modal-investment', investment.toLocaleString('en-IN'));
    updateText('modal-monthly-savings', monthlySavings.toLocaleString('en-IN'));
    updateText('modal-annual-savings', annualSavings.toLocaleString('en-IN'));
    updateText('modal-lifetime-savings', r.lifetimeSavings.toLocaleString('en-IN'));
    updateText('modal-payback-period', paybackPeriod);
    updateText('modal-roi', r.roi);
    updateText('modal-co2-reduction', co2Reduction);
    updateText('modal-lifetime-co2', r.lifetimeCo2.toLocaleString('en-IN'));
    updateText('modal-tree-equivalent', treeEquivalent);
    updateText('modal-footprint-reduction', r.footprintReduction);

    if (resultsContainer) {
      resultsContainer.classList.remove('hidden');
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  });

  if (detailedReportButton) {
    detailedReportButton.addEventListener('click', function () {
      if (window.openModal) window.openModal('report-modal');
    });
  }

  if (downloadReportButton) {
    downloadReportButton.addEventListener('click', function () {
      if (lastReport) downloadSavingsReport(lastReport);
    });
  }

  if (contactFromModalButton) {
    contactFromModalButton.addEventListener('click', function () {
      if (window.closeModal) window.closeModal('report-modal');
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html#contact';
      }
    });
  }
}

/** Builds a plain-text savings estimate and triggers a client-side download. */
function downloadSavingsReport(report) {
  const { input, result } = report;
  const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const num = (n) => Number(n).toLocaleString('en-IN');
  const lines = [
    'SOLARIDE — Solar Savings Estimate',
    'https://solaride.in',
    '',
    'Your inputs',
    `  Monthly electricity bill: ${money(input.monthlyBill)}`,
    `  Rooftop area: ${num(input.roofArea)} sq ft`,
    `  Sunlight level: ${input.location}`,
    '',
    'Recommended system',
    `  System size: ${result.systemSize} kW (~${result.panelCount} panels, ~${result.roofAreaUsed} sq ft)`,
    `  Estimated investment: ${money(result.investment)}`,
    `  Annual generation: ${num(result.energyProductionAnnual)} kWh`,
    '',
    'Savings',
    `  Monthly savings: ${money(result.monthlySavings)}`,
    `  Annual savings: ${money(result.annualSavings)}`,
    `  Lifetime savings (30 yrs): ${money(result.lifetimeSavings)}`,
    `  Payback period: ${result.paybackPeriod} years`,
    `  Return on investment: ${result.roi}%`,
    '',
    'Environmental impact',
    `  CO2 reduction: ${result.co2Reduction} tonnes/year`,
    `  Equivalent trees planted: ${num(result.treeEquivalent)}`,
    '',
    'Estimates only; actual figures vary with location, weather, tariffs and system design.',
    'Free site survey: +91 62844 59603 · solarideenergy@gmail.com'
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solaride-savings-estimate.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function animateNumberChange(element, targetValue) {
  if (!element) return;
  const startValue = parseFloat(element.textContent.replace(/,/g, '')) || 0;
  const duration = 1000;
  const start = performance.now();

  function updateValue(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = startValue + (targetValue - startValue) * progress;

    if (Number.isInteger(targetValue)) {
      element.textContent = Math.round(currentValue).toLocaleString();
    } else {
      element.textContent = currentValue.toFixed(1);
    }

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  }

  requestAnimationFrame(updateValue);
}
