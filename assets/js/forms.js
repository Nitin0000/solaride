document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initNewsletterForm();
  initQuestionForm();
});

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const sendMessageBtn = document.getElementById('send-message-btn');
  
  if (!contactForm) return;

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: "vq6UY47u87bfIjpHD" });
  } else {
    console.warn('EmailJS not loaded');
    return;
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const serviceID = "service_6t10hrb";
    const templateID = "template_7couqri";

    const templateParams = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      phone: contactForm.phone.value,
      subject: contactForm.subject.value,
      message: contactForm.message.value,
    };

    if (sendMessageBtn) sendMessageBtn.disabled = true;

    emailjs.send(serviceID, templateID, templateParams)
      .then(() => {
        contactForm.reset();
        if (window.openModal) window.openModal('success-modal');
      })
      .catch((error) => {
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again later.');
      })
      .finally(() => {
        if (sendMessageBtn) sendMessageBtn.disabled = false;
      });
  });
}

function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');
  
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (email && email.includes('@')) {
      if (window.openModal) window.openModal('newsletter-success-modal');
      this.reset();
    }
  });
}

function initQuestionForm() {
  const questionForm = document.getElementById('question-form');
  const questionSuccess = document.getElementById('question-success');
  const askQuestionButton = document.getElementById('open-custom-question');
  
  if (askQuestionButton) {
    askQuestionButton.addEventListener('click', () => {
      if (questionForm) {
        questionForm.reset();
        questionForm.classList.remove('hidden');
      }
      if (questionSuccess) questionSuccess.classList.add('hidden');
      if (window.openModal) window.openModal('question-modal');
    });
  }

  if (!questionForm) return;

  questionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Simulate submission
    setTimeout(function () {
      questionForm.classList.add('hidden');
      if (questionSuccess) questionSuccess.classList.remove('hidden');
    }, 500);
  });
  
  const questionCloseSuccess = document.getElementById('question-close-success');
  if (questionCloseSuccess) {
    questionCloseSuccess.addEventListener('click', () => {
      if (window.closeModal) window.closeModal('question-modal');
    });
  }
}
