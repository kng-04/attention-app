document.addEventListener('DOMContentLoaded', () => {
  const partner = JSON.parse(localStorage.getItem('partnerDetails'));
  const smsBtn = document.getElementById('smsBtn');
  const defaultBtn = document.getElementById('defaultBtn');
  const customMsg = document.getElementById('customMsg');

  if (partner && partner.phone) {
    const phone = encodeURIComponent(partner.phone);

    smsBtn.addEventListener('click', () => {
      const message = encodeURIComponent(customMsg.value.trim() || "Hey! Can we cuddle ? 🥺");
      smsBtn.href = `sms:${phone}?&body=${message}`;
    });

    defaultBtn.addEventListener('click', () => {
      const message = encodeURIComponent("Hey! Can we cuddle ? 🥺");
      window.location.href = `sms:${phone}?&body=${message}`;
    });

  } else {
    smsBtn.href = "#";
    smsBtn.textContent = "No partner number saved";
    smsBtn.classList.add("disabled");
    defaultBtn.disabled = true;
  }
});
