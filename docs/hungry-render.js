document.addEventListener('DOMContentLoaded', () => {
  const drinkCheckbox = document.getElementById('wantDrink');
  const drinkInput = document.getElementById('drinkInput');
  const sweetRadio = document.getElementById('sweet');
  const savoryRadio = document.getElementById('savory');
  const dessertOptions = document.getElementById('dessertOptions');
  const dessertDetailInput = document.getElementById('dessertDetail');
  const unsureBtn = document.getElementById('unsureBtn');
  const submitBtn = document.getElementById('submitBtn');

  if (drinkCheckbox && drinkInput) {
    drinkCheckbox.addEventListener('change', () => {
      drinkInput.style.display = drinkCheckbox.checked ? 'block' : 'none';
    });
  }

  if (sweetRadio && dessertOptions) {
    sweetRadio.addEventListener('change', () => {
      if (sweetRadio.checked) dessertOptions.style.display = 'block';
    });
  }

  if (savoryRadio && dessertOptions && dessertDetailInput) {
    savoryRadio.addEventListener('change', () => {
      if (savoryRadio.checked) {
        dessertOptions.style.display = 'none';
        dessertDetailInput.value = '';
      }
    });
  }

  if (unsureBtn) {
    unsureBtn.addEventListener('click', () => {
      const message = "I'm not sure what I want to eat yet 😅";
      sendText(message);
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const restaurant = document.getElementById('restaurant')?.value.trim() || '';
      const items = document.getElementById('foodItems')?.value.trim() || '';
      const utensils = Array.from(document.querySelectorAll('input[name="utensils"]:checked')).map(el => el.value);
      const cuisine = document.getElementById('cuisine')?.value.trim() || '';
      const meat = document.getElementById('meat')?.value.trim() || '';
      const carbs = document.getElementById('carbs')?.value.trim() || '';
      const drink = drinkCheckbox?.checked ? `Drink: ${document.getElementById('drink')?.value.trim() || ''}` : "No drink";

      let dessertMsg = "";
      if (sweetRadio?.checked) {
        const selectedDessert = document.querySelector('input[name="dessert"]:checked');
        const detail = dessertDetailInput?.value.trim() || '';
        if (selectedDessert) {
          dessertMsg = `Dessert: ${selectedDessert.value} - ${detail}`;
        }
      }

      const message = `
        🍴 Food Order:
        Restaurant: ${restaurant}
        Items: ${items}
        ${drink}
        Utensils: ${utensils.join(', ') || 'None'}
        Cuisine: ${cuisine}
        Meat: ${meat}
        Carbs: ${carbs}
        ${dessertMsg}
      `.trim();

      sendText(message);
    });
  }

  function sendText(message) {
    const partner = JSON.parse(localStorage.getItem('partnerDetails'));
    if (partner && partner.phone) {
      let rawPhone = partner.phone.replace(/\s+/g, '');
      if (rawPhone.startsWith('0')) rawPhone = '+64' + rawPhone.slice(1);
      const phone = encodeURIComponent(rawPhone);
      const body = encodeURIComponent(message);
      window.location.href = `sms:${phone}?&body=${body}`;

      // Auto-redirect to menu after short delay
      setTimeout(() => {
        window.location.href = "menu.html";
      }, 500);
    } else {
      alert("No partner number saved.");
    }
  }
});