document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
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

    // Use FormData so field access is by name (avoids form.name resolving to the
    // form's own `name` attribute instead of the "name" input).
    const data = new FormData(contactForm);
    const templateParams = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      subject: data.get('subject'),
      message: data.get('message'),
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
