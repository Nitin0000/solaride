window.SolarideUtils = {
  /**
   * Traps focus within a modal element.
   * @param {HTMLElement} modal - The modal element to trap focus in.
   */
  trapFocus: function(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', function(e) {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) { /* shift + tab */
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { /* tab */
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    });

    // Focus first element
    if (firstFocusableElement) firstFocusableElement.focus();
  },

  /**
   * Formats a number as currency (INR).
   * @param {number} amount - The amount to format.
   * @returns {string} - The formatted currency string.
   */
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Animates a number change.
   * @param {HTMLElement} element - The element to update.
   * @param {number} start - The starting number.
   * @param {number} end - The ending number.
   * @param {number} duration - The duration in ms.
   * @param {function} formatter - Optional formatter function.
   */
  animateValue: function(element, start, end, duration, formatter) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = formatter ? formatter(value) : value;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
};
