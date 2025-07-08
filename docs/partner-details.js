document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('partnerForm');
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get('edit') === '1';

  // Prefill if editing
  if (isEdit) {
    const stored = localStorage.getItem('partnerDetails');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.firstName && data.lastName && data.phone) {
          document.getElementById('partnerFName').value = data.firstName;
          document.getElementById('partnerLName').value = data.lastName;
          // Remove +64 for editing if it was stored with it
          document.getElementById('partnerPhone').value = data.phone.replace(/^\+64/, '0');
        }
      } catch (e) {
        console.warn('Invalid partnerDetails format');
      }
    }
  }

  // Save on submit
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
        firstName,
        lastName,
        phone: formattedPhone
      };

      localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
      localStorage.setItem('partnerDetailsAdded', 'true');

      // ✅ This must redirect to index.html for the updated button to load
      window.location.href = './index.html';
    });
  }
});
