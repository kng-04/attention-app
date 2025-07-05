document.addEventListener('DOMContentLoaded', () => {
  const partner = JSON.parse(localStorage.getItem('partnerDetails'));

  const smsBtn = document.getElementById('smsBtn');
  const defaultBtn = document.getElementById('defaultBtn');
  const callBtn = document.getElementById('callBtn');
  const customMsg = document.getElementById('customMsg');

  if (partner && partner.phone) {
    // Normalize to +64 format
    let rawPhone = partner.phone.replace(/\s+/g, '');
    if (rawPhone.startsWith('0')) {
      rawPhone = '+64' + rawPhone.slice(1);
    }

    // For display (if needed elsewhere)
    const formattedPhone = rawPhone.replace(
      /^\+64(\d{1,2})(\d{3})(\d{3,4})$/,
      '+64 $1 $2 $3'
    );

    const phone = encodeURIComponent(rawPhone); // For sms: and tel:

    if (smsBtn && customMsg) {
      smsBtn.addEventListener('click', () => {
        const message = encodeURIComponent(customMsg.value.trim() || "Are we able to call pleaseeee ? 🥰");
        smsBtn.href = `sms:${phone}?&body=${message}`;
      });
    }

    if (defaultBtn) {
      defaultBtn.addEventListener('click', () => {
        const message = encodeURIComponent("Are we able to call pleaseeee ? 🥰");
        window.location.href = `sms:${phone}?&body=${message}`;
      });
    }

    if (callBtn) {
      callBtn.href = `tel:${phone}`;
    }

  } else {
    if (smsBtn) {
      smsBtn.href = "#";
      smsBtn.textContent = "No partner number saved";
      smsBtn.classList.add("disabled");
    }
    if (defaultBtn) defaultBtn.disabled = true;
    if (callBtn) {
      callBtn.href = "#";
      callBtn.classList.add("disabled");
    }
  }
});