document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('partnerForm');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstName = document.getElementById('partnerFName').value.trim();
      const lastName = document.getElementById('partnerLName').value.trim();
      const phone = document.getElementById('partnerPhone').value.trim().replace(/\s+/g, '');
      const formattedPhone = phone.startsWith('0')
        ? '+64' + phone.slice(1)
        : phone;

      if (!firstName || !lastName || !phone) {
        alert('Please fill in all fields.');
        return;
      }

      const partnerData = {
        name: `${firstName} ${lastName}`,
        phone: formattedPhone
      };

      localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
      localStorage.setItem('partnerDetailsAdded', 'true');

      // ✅ This must redirect to index.html for the updated button to load
      window.location.href = './index.html';
    });
  }
});
