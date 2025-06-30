window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addPartnerBtn');
  const menuBtn = document.getElementById('menuBtn');
  const menuLabel = document.getElementById('menuLabel');

  if (localStorage.getItem('partnerDetailsAdded') === 'true') {
    // Hide Add button and show Go to Menu
    if (addBtn) addBtn.style.display = 'none';
    if (menuBtn) {
      menuBtn.style.display = 'inline-flex';
      menuLabel.textContent = 'Partner Details Added';
    }

    menuBtn.addEventListener('click', () => {
      window.location.href = './menu.html';
    });
  } else {
    // Default click listener to go to menu
    menuBtn?.addEventListener('click', () => {
      window.location.href = './menu.html';
    });
  }
});