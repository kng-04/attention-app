document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('partnerButtonContainer');
  const detailsCard = document.getElementById('partnerDetailsCard');
  const pdName = document.getElementById('pdName');
  const pdPhone = document.getElementById('pdPhone');

  container.innerHTML = '';

  const rawData = localStorage.getItem('partnerDetails');
  let data = null;

  try {
    data = JSON.parse(rawData);
  } catch (e) {
    data = null;
  }

  const hasDetails = data && data.firstName && data.lastName && data.phone;

  if (hasDetails) {
    pdName.textContent = `${data.firstName} ${data.lastName}`;
    pdPhone.textContent = data.phone;

    container.innerHTML = `
      <button class="menu-btn" id="viewBtn">
        <img src="./assets/add.png" alt="View" class="menu-icon" />
        <span>View Partner Details</span>
      </button>
    `;

    // Toggle visibility of details card
    document.getElementById('viewBtn').addEventListener('click', () => {
      const isVisible = detailsCard.style.display === 'block';
      detailsCard.style.display = isVisible ? 'none' : 'block';
    });
  } else {
    container.innerHTML = `
      <a href="./partner-details.html" class="menu-btn">
        <img src="./assets/add.png" alt="Add icon" class="menu-icon" />
        <span>Add Partner Details</span>
      </a>
    `;
    detailsCard.style.display = 'none';
  }
});
