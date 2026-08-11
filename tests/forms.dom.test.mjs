import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript, fireDomReady } from './helpers/dom.mjs';

describe('Contact form (DOM)', () => {
  let sendMock;

  beforeEach(() => {
    sendMock = vi.fn(() => Promise.resolve());
    window.emailjs = { init: vi.fn(), send: sendMock };
    window.openModal = vi.fn();

    document.body.innerHTML = `
      <form id="contact-form">
        <input name="name" value="Asha" />
        <input name="email" value="asha@example.com" />
        <input name="phone" value="9999999999" />
        <input name="subject" value="residential" />
        <textarea name="message">Interested in solar</textarea>
        <button id="send-message-btn" type="submit">Send</button>
      </form>`;
    loadScript('assets/js/forms.js');
    fireDomReady();
  });

  it('sends the message through EmailJS with the form values', async () => {
    document.getElementById('contact-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true })
    );
    expect(sendMock).toHaveBeenCalled();
    const params = sendMock.mock.calls[0][2];
    expect(params).toMatchObject({
      name: 'Asha',
      email: 'asha@example.com',
      subject: 'residential'
    });
  });

  it('opens the success modal once the send resolves', async () => {
    document.getElementById('contact-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true })
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(window.openModal).toHaveBeenCalledWith('success-modal');
  });
});

describe('Newsletter form (DOM)', () => {
  beforeEach(() => {
    window.openModal = vi.fn();
    document.body.innerHTML = `
      <form id="newsletter-form">
        <input type="email" value="reader@example.com" />
        <button type="submit">Join</button>
      </form>`;
    loadScript('assets/js/forms.js');
    fireDomReady();
  });

  it('accepts a valid email and shows the success modal', () => {
    document.getElementById('newsletter-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true })
    );
    expect(window.openModal).toHaveBeenCalledWith('newsletter-success-modal');
  });

  it('ignores an invalid email', () => {
    const input = document.querySelector('#newsletter-form input');
    input.value = 'not-an-email';
    document.getElementById('newsletter-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true })
    );
    expect(window.openModal).not.toHaveBeenCalled();
  });
});
