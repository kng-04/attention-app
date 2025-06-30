document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('partnerForm');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent page reload

      const firstName = document.getElementById('partnerFName').value.trim();
      const lastName = document.getElementById('partnerLName').value.trim();
      const phone = document.getElementById('partnerPhone').value.trim();

      if (!firstName || !lastName || !phone) {
        alert('Please fill in all fields.');
        return;
      }

      const partnerData = { firstName, lastName, phone };
      localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
      localStorage.setItem('partnerDetailsAdded', 'true');

      window.location.href = './index.html';
    });
  }
});
