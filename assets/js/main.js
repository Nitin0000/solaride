document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initBackToTop();
  initAnimations();
  initNavigation();
});

function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuButton || !mobileMenu) return;

  mobileMenuButton.addEventListener('click', function () {
    const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', !expanded);
    mobileMenu.classList.toggle('hidden');

    // Change hamburger icon to X when menu is open
    if (!expanded) {
      mobileMenuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    } else {
      mobileMenuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>';
    }
  });

  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>';
    });
  });
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const header = document.getElementById('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');
  if (!backToTopButton) return;

  backToTopButton.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.remove('opacity-0');
      backToTopButton.classList.add('opacity-100');
    } else {
      backToTopButton.classList.remove('opacity-100');
      backToTopButton.classList.add('opacity-0');
    }
  });
}

function initAnimations() {
  // Add interactive behaviors
  const interactiveElements = document.querySelectorAll('.interactive-element');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('hover');
    });
    element.addEventListener('mouseleave', () => {
      element.classList.remove('hover');
    });
  });

  // Initialize any dynamic content
  const dynamicContent = document.querySelectorAll('[data-dynamic]');
  dynamicContent.forEach(content => {
    // Add fade-in animation
    content.classList.add('fade-in');
  });
}

function initNavigation() {
  // Handle navigation
  function handleNavigation(event) {
    const link = event.currentTarget;
    if (link.hasAttribute('data-nav')) {
      event.preventDefault();
      const target = link.getAttribute('data-nav');
      const targetElement = document.querySelector(target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Initialize navigation
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
}
