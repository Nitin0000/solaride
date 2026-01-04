document.addEventListener('DOMContentLoaded', () => {
  initFAQAccordion();
  initFAQCategories();
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

function initFAQCategories() {
  const categoryButtons = document.querySelectorAll('.faq-category-btn');
  const categoryModal = document.getElementById('faq-category-modal');
  const categoryContents = document.querySelectorAll('.category-content');
  const categoryModalTitle = document.getElementById('category-modal-title');
  
  if (!categoryModal) return;

  categoryButtons.forEach(button => {
    button.addEventListener('click', function () {
      const category = this.getAttribute('data-category');
      openCategoryModal(category);
    });
  });

  function openCategoryModal(category) {
    // Hide all category contents
    categoryContents.forEach(content => {
      content.classList.add('hidden');
    });

    // Show selected category content
    const selectedContent = document.getElementById(`${category}-faqs`);
    if (selectedContent) selectedContent.classList.remove('hidden');

    // Update modal title
    let categoryTitle = '';
    if (category === 'technical') categoryTitle = 'Technical Questions';
    if (category === 'financial') categoryTitle = 'Financial Questions';
    if (category === 'environmental') categoryTitle = 'Environmental Impact';
    if (categoryModalTitle) categoryModalTitle.textContent = categoryTitle;

    // Show modal using generic modal handler if available
    if (window.openModal) {
      window.openModal('faq-category-modal');
    } else {
      categoryModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  // Category FAQ Toggle functionality (inside modal)
  const categoryFaqToggles = document.querySelectorAll('.category-faq-toggle');
  categoryFaqToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const content = this.nextElementSibling;
      const icon = this.querySelector('.category-faq-icon');

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
