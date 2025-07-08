window.addEventListener('DOMContentLoaded', () => {
  const partnerContainer = document.getElementById('partnerButtonContainer');
  const menuContainer = document.getElementById('menuButtonContainer');
  const detailsCard = document.getElementById('partnerDetailsCard');
  const pdName = document.getElementById('pdName');
  const pdPhone = document.getElementById('pdPhone');

  partnerContainer.innerHTML = '';
  if (menuContainer) menuContainer.innerHTML = '';
  detailsCard.style.display = 'none';

  // Try reading partner data
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem('partnerDetails'));
  } catch (e) {
    data = null;
  }

  const hasDetails = data && data.firstName && data.lastName && data.phone;

  if (!hasDetails) {
    // New user → show only add partner option
    partnerContainer.innerHTML = `
      <a href="./partner-details.html" class="menu-btn">
        <img src="./assets/add.png" alt="Add icon" class="menu-icon" />
        <span>Add Partner Details</span>
      </a>
    `;
    return;
  }

  // Returning user → show details + menu button
  pdName.textContent = `${data.firstName} ${data.lastName}`;
  
  let formattedPhone = data.phone;
  if (/^0\d{8,9}$/.test(data.phone)) {
    formattedPhone = '+64 ' + data.phone.slice(1).replace(/(\d{2})(\d{3})(\d{3,4})/, '$1 $2 $3');
  } else if (/^\+64\d{8,9}$/.test(data.phone)) {
    formattedPhone = data.phone.replace(/^\+64(\d{2})(\d{3})(\d{3,4})$/, '+64 $1 $2 $3');
  }
  pdPhone.textContent = formattedPhone;

  detailsCard.style.display = 'block';

  partnerContainer.innerHTML = `
    <button class="menu-btn" id="viewBtn">
      <img src="./assets/add.png" alt="View" class="menu-icon" />
      <span>View Partner Details</span>
    </button>
  `;

  if (menuContainer) {
    menuContainer.innerHTML = `
      <a href="./menu.html" class="menu-btn">
        <img src="./assets/menu.png" alt="Menu icon" class="menu-icon" />
        <span>Go to Menu</span>
      </a>
    `;
  }

  // Toggle partner card visibility
  document.getElementById('viewBtn').addEventListener('click', () => {
    const isVisible = detailsCard.style.display === 'block';
    detailsCard.style.display = isVisible ? 'none' : 'block';
  });
});