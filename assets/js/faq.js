document.addEventListener('DOMContentLoaded', () => {
  initFAQAccordion();
});

function initFAQAccordion() {
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const contentId = this.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      const icon = this.querySelector('.faq-icon');

      this.setAttribute('aria-expanded', !expanded);

      if (content) {
        if (expanded) {
          content.classList.add('hidden');
          if (icon) icon.classList.remove('rotate-180');
        } else {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      }
    });
  });
}
