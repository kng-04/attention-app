document.addEventListener('DOMContentLoaded', () => {
  const partnerData = localStorage.getItem('partnerDetails');
  const container = document.getElementById('partnerButtonContainer');

  if (partnerData && container) {
    container.innerHTML = `
      <button class="menu-btn" disabled style="opacity: 0.7; cursor: default;">
        <img src="./assets/add.png" alt="Add icon" class="menu-icon" />
        <span>Partner Details Added</span>
      </button>`;
  } else if (container) {
    container.innerHTML = `
      <a href="./partner-details.html" class="menu-btn">
        <img src="./assets/add.png" alt="Add icon" class="menu-icon" />
        <span>Add Partner Details</span>
      </a>`;
  }
});
