document.addEventListener('DOMContentLoaded', () => {
  const partner = JSON.parse(localStorage.getItem('partnerDetails'));
  const defaultBtn = document.getElementById('defaultBtn');

  if (partner && partner.phone) {
    const phone = encodeURIComponent(partner.phone);
    const message = encodeURIComponent("Hey! Can we cuddle ? 🥺");

    defaultBtn.addEventListener('click', () => {
      window.location.href = `sms:${phone}?&body=${message}`;
    });

  } else {
    defaultBtn.textContent = "No partner number saved";
    defaultBtn.disabled = true;
  }
});