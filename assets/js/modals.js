document.addEventListener('DOMContentLoaded', () => {
  // Generic Modal Logic
  const modals = document.querySelectorAll('[id$="-modal"]');
  
  modals.forEach(modal => {
    // Find close buttons (both data attribute and class based for backward compatibility)
    const closeButtons = modal.querySelectorAll('[data-close-modal], .close-modal-btn, [id^="close-"]');
    
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal.id));
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close on Escape (Global)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('[id$="-modal"]:not(.hidden)');
      if (openModal) {
        closeModal(openModal.id);
      }
    }
  });

  // Team Modal Specific Logic
  const teamDetailButtons = document.querySelectorAll('.team-detail-btn');
  const readMorePankaj = document.getElementById('read-more-pankaj');
  
  if (readMorePankaj) {
    readMorePankaj.addEventListener('click', () => openTeamModal('pankaj'));
  }

  teamDetailButtons.forEach(button => {
    button.addEventListener('click', function() {
      const member = this.getAttribute('data-member');
      openTeamModal(member);
    });
  });

  // Story Modal Logic
  const readMoreStoryBtn = document.getElementById('read-more-btn');
  if (readMoreStoryBtn) {
    readMoreStoryBtn.addEventListener('click', () => openModal('story-modal'));
  }
});

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    
    // Trap focus
    if (window.SolarideUtils && window.SolarideUtils.trapFocus) {
      window.SolarideUtils.trapFocus(modal);
    }
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');
  }
};

function openTeamModal(memberId) {
  const teamModal = document.getElementById('team-modal');
  if (!teamModal) return;

  const teamProfiles = teamModal.querySelectorAll('.team-profile');
  
  // Hide all profiles
  teamProfiles.forEach(profile => {
    profile.classList.add('hidden');
  });

  // Show selected profile
  const selectedProfile = document.getElementById(`${memberId}-profile`);
  if (selectedProfile) {
    selectedProfile.classList.remove('hidden');
  }

  // Update title
  const title = document.getElementById('team-modal-title');
  if (title) {
    title.textContent = memberId === 'pankaj' ? "Pankaj's Journey" : "Team Member Profile";
  }

  openModal('team-modal');
}
