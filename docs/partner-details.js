document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('partnerForm');
  const pinField = document.getElementById('pinFieldContainer');
  const countrySel = document.getElementById('countryCode');
  const phoneInput = document.getElementById('partnerPhone');

  // Check if editing an existing user
  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';

  if (isEdit) {
    // Hide the PIN field when editing
    if (pinField) pinField.style.display = 'none';
    const pinInput = document.getElementById('partnerPin');
    if (pinInput) pinInput.removeAttribute('required');
  }

  // Prefill fields if editing
  if (isEdit) {
    const stored = localStorage.getItem('partnerDetails');
    if (stored) {
      try {
        const data = JSON.parse(stored);

        if (data.firstName) document.getElementById('partnerFName').value = data.firstName;
        if (data.lastName) document.getElementById('partnerLName').value = data.lastName;

        // Prefill country & local number from stored E.164-like value
        if (data.phone && countrySel && phoneInput) {
          if (data.phone.startsWith('+64')) {
            countrySel.value = '+64';
            // Show local NZ number without +64 (no leading 0 added)
            phoneInput.value = data.phone.replace(/^\+64/, '');
          } else if (data.phone.startsWith('+852')) {
            countrySel.value = '+852';
            // Show local HK number without +852
            phoneInput.value = data.phone.replace(/^\+852/, '');
          } else {
            // Fallback: leave country as current selection, show raw
            phoneInput.value = data.phone.replace(/^\+\d+/, '');
          }
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
      const pinInput = document.getElementById('partnerPin');

      // Basic field checks
      const rawLocal = (phoneInput?.value || '').trim().replace(/\s+/g, '');
      const countryCode = (countrySel?.value || '').trim();

      // Build stored number:
      // - For NZ: strip a leading trunk "0" if user typed one (e.g., 021… -> +64 21…)
      // - For HK: do NOT strip leading zeros (HK numbers typically don't start with 0 anyway)
      let local = rawLocal;
      if (countryCode === '+64') {
        local = rawLocal.replace(/^0+/, '');
      }

      const formattedPhone = countryCode + local;

      const pin = pinInput ? pinInput.value.trim() : '';

      // Validate fields
      if (!firstName || !lastName || !rawLocal || !countryCode ||
          (!isEdit && (!pin || !/^\d{4}$/.test(pin)))) {
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