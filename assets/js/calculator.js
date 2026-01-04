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

    // Simple calculations based on inputs
    const co2Offset = (systemSize * 0.7 * (sunlightHours / 5)).toFixed(1);
    const treeEquivalent = Math.round(systemSize * 20 * (sunlightHours / 5));
    const energyProduced = Math.round(systemSize * 1400 * (sunlightHours / 5));

    // Update result displays with animation
    animateNumberChange(co2OffsetDisplay, parseFloat(co2Offset));
    animateNumberChange(treeEquivalentDisplay, treeEquivalent);
    animateNumberChange(energyProducedDisplay, energyProduced);
  });
}

function initSolarSavingsCalculator() {
  const calculateButton = document.getElementById('calculate-button');
  const resultsContainer = document.getElementById('results-container');
  const detailedReportButton = document.getElementById('detailed-report-button');
  const downloadReportButton = document.getElementById('download-report');
  const contactFromModalButton = document.getElementById('contact-from-modal');
  
  if (!calculateButton) return;

  calculateButton.addEventListener('click', function () {
    const monthlyBillInput = document.getElementById('monthly-bill');
    const roofAreaInput = document.getElementById('roof-area');
    const locationInput = document.getElementById('location');
    
    if (!monthlyBillInput || !roofAreaInput) return;

    const monthlyBill = parseFloat(monthlyBillInput.value);
    const roofArea = parseFloat(roofAreaInput.value);
    const location = locationInput ? locationInput.value : 'medium';

    // Calculate results
    const systemSize = Math.min(Math.round(monthlyBill / 600), Math.floor(roofArea / 10));

    let locationFactor = 1;
    if (location === 'high') locationFactor = 1.2;
    if (location === 'low') locationFactor = 0.8;

    const investmentPerKw = 60000;
    const investment = systemSize * investmentPerKw;
    const monthlyGeneration = systemSize * 120 * locationFactor;
    const electricityRate = 8;
    const monthlySavings = monthlyGeneration * electricityRate;
    const annualSavings = monthlySavings * 12;
    const paybackPeriod = Math.round((investment / annualSavings) * 10) / 10;

    const co2ReductionPerKw = 0.7;
    const co2Reduction = (systemSize * co2ReductionPerKw).toFixed(1);
    const treesPerTonneCO2 = 28.5;
    const treeEquivalent = Math.round(co2Reduction * treesPerTonneCO2);

    // Update results display
    updateText('system-size', systemSize);
    updateText('investment', investment.toLocaleString());
    updateText('monthly-savings', monthlySavings.toLocaleString());
    updateText('annual-savings', annualSavings.toLocaleString());
    updateText('payback-period', paybackPeriod);
    updateText('co2-reduction', co2Reduction);
    updateText('tree-equivalent', treeEquivalent);

    // Update modal values
    updateText('modal-system-size', systemSize);
    updateText('modal-panel-count', systemSize * 3);
    updateText('modal-roof-area', systemSize * 6);
    updateText('modal-energy-production', (monthlyGeneration * 12).toLocaleString());
    updateText('modal-investment', investment.toLocaleString());
    updateText('modal-monthly-savings', monthlySavings.toLocaleString());
    updateText('modal-annual-savings', annualSavings.toLocaleString());
    updateText('modal-lifetime-savings', (annualSavings * 25).toLocaleString());
    updateText('modal-payback-period', paybackPeriod);
    updateText('modal-roi', Math.round((annualSavings * 25 / investment) * 100));
    updateText('modal-co2-reduction', co2Reduction);
    updateText('modal-lifetime-co2', (co2Reduction * 25).toLocaleString());
    updateText('modal-tree-equivalent', treeEquivalent);
    updateText('modal-footprint-reduction', Math.min(90, Math.round(systemSize * 6)));

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
      alert('Your detailed solar report will be downloaded shortly.');
    });
  }

  if (contactFromModalButton) {
    contactFromModalButton.addEventListener('click', function () {
      if (window.closeModal) window.closeModal('report-modal');
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
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
