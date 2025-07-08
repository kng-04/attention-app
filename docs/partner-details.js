document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('partnerForm');
  const pinField = document.getElementById('pinFieldContainer');

  // Check if editing an existing user
  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';

  if (isEdit) {
    // Hide the PIN field when editing
    if (pinField) {
      pinField.style.display = 'none';
    }
    const pinInput = document.getElementById('partnerPin');
    if (pinInput) {
      pinInput.removeAttribute('required');
    }
  }

  // Prefill fields if editing
  if (isEdit) {
    const stored = localStorage.getItem('partnerDetails');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.firstName && data.lastName && data.phone) {
          document.getElementById('partnerFName').value = data.firstName;
          document.getElementById('partnerLName').value = data.lastName;
          document.getElementById('partnerPhone').value = data.phone.replace(/^\+64/, '0');
        }
      } catch (e) {
        console.warn('Invalid partnerDetails format');
      }
    }
  }

  // Save data on submit
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstName = document.getElementById('partnerFName').value.trim();
      const lastName = document.getElementById('partnerLName').value.trim();
      const phoneRaw = document.getElementById('partnerPhone').value.trim().replace(/\s+/g, '');
      const formattedPhone = phoneRaw.startsWith('0') ? '+64' + phoneRaw.slice(1) : phoneRaw;

      const pinInput = document.getElementById('partnerPin');
      const pin = pinInput ? pinInput.value.trim() : '';

      // Validate fields
      if (!firstName || !lastName || !phoneRaw || (!isEdit && (!pin || !/^\d{4}$/.test(pin)))) {
        alert('Please fill in all fields correctly' + (!isEdit ? ' including a 4-digit PIN.' : '.'));
        return;
      }

      const partnerData = {
        firstName,
        lastName,
        phone: formattedPhone
      };

      if (isEdit) {
        const stored = JSON.parse(localStorage.getItem('partnerDetails') || '{}');
        if (stored.pin) {
          partnerData.pin = stored.pin; // retain existing pin
        }
      } else if (pin) {
        partnerData.pin = pin; // set new pin
      }

      localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
      localStorage.setItem('partnerDetailsAdded', 'true');

      if (!isEdit) {
        sessionStorage.setItem('pinValidated', 'true');
      }

      // Redirect back to homepage
      window.location.href = './index.html';
    });
  }
});