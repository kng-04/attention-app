/*──────────────────────────────────────────────────────────────*/
/*  Attention-App index page logic                              */
/*──────────────────────────────────────────────────────────────*/

const FAIL_KEY         = 'pinFailCount';   // sessionStorage key
const MAX_PIN_ATTEMPTS = 3;                // lock threshold

function registerFail () {
  const c = Number(sessionStorage.getItem(FAIL_KEY) || 0) + 1;
  sessionStorage.setItem(FAIL_KEY, String(c));
  return c;
}

function resetSessionFlags () {
  sessionStorage.removeItem(FAIL_KEY);
  sessionStorage.removeItem('pinValidated');
}

function formatNZ(phone) {
  if (/^0\d{8,9}$/.test(phone)) {
    return '+64 ' + phone.slice(1).replace(/(\d{1,2})(\d{3})(\d{3,4})/, '$1 $2 $3');
  }
  return phone.replace(/^\+64(\d{1,2})(\d{3})(\d{3,4})$/, '+64 $1 $2 $3');
}

document.addEventListener('DOMContentLoaded', () => {
  const partnerContainer = document.getElementById('partnerButtonContainer');
  const menuContainer    = document.getElementById('menuButtonContainer');
  const detailsCard      = document.getElementById('partnerDetailsCard');
  const pdName           = document.getElementById('pdName');
  const pdPhone          = document.getElementById('pdPhone');
  const forgotContainer  = document.getElementById('forgotPinContainer');
  const pinPrompt        = document.getElementById('pinPromptContainer');

  let data = null;
  try {
    data = JSON.parse(localStorage.getItem('partnerDetails'));
  } catch {}

  const hasDetails = data && data.firstName && data.lastName && data.phone && data.pin;

  pdName.textContent = hasDetails ? `${data.firstName} ${data.lastName}` : '';
  pdPhone.textContent = hasDetails ? formatNZ(data.phone) : '';

  if (!hasDetails) {
    partnerContainer.innerHTML = `
      <a href="./partner-details.html" class="menu-btn">
        <img src="./assets/add.png" class="menu-icon" alt="add" />
        <span>Add Partner Details</span>
      </a>`;
    return;
  }

  // ✅ Set the View Partner button
  partnerContainer.innerHTML = `
    <a href="#" class="menu-btn" id="viewBtn">
      <img src="./assets/add.png" class="menu-icon" alt="view" />
      <span>View Partner Details</span>
    </a>`;

  menuContainer.innerHTML = `
    <a href="./menu.html" class="menu-btn">
      <img src="./assets/menu.png" class="menu-icon" alt="menu" />
      <span>Go to Menu</span>
    </a>`;

  // ✅ Now attach listener AFTER DOM is updated
  document.getElementById('viewBtn')?.addEventListener('click', () => {
    pinPrompt.innerHTML = '';                // Clear any previous PIN prompts
    detailsCard.classList.add('hidden');     // Always hide the details first
    showPinPrompt();                         // Ask for PIN every time
  });

  function showPinPrompt() {
    pinPrompt.innerHTML = `
      <form id="pinForm" style="text-align:center; margin-top: 1em;">
        <div style="margin-bottom: 1em;">
          <label for="pinInput"><strong>Enter your 4-digit PIN:</strong></label><br/>
          <div style="position: relative; display: inline-block;">
            <input 
              type="password" 
              id="pinInput" 
              maxlength="4" 
              inputmode="numeric" 
              pattern="\\d{4}" 
              required 
              style="padding: 0.75em; width: 10em; font-size: 1.2em; margin-top: 0.5em; text-align: center; border-radius: 0.5em;" />
            <button type="button" id="togglePin" 
              style="position: absolute; right: -2em; top: 50%; transform: translateY(-50%);
                    font-size: 1.1em; background: none; border: none; cursor: pointer;">
              👁
            </button>
          </div>
        </div>
        <button type="submit" class="menu-btn" style="margin-top: 0.5em;">
          <img src="./assets/unlock.png" alt="Unlock" class="menu-icon" />
          <span>Unlock</span>
        </button>
      </form>
    `;

    // Toggle PIN visibility
    const toggleBtn = document.getElementById('togglePin');
    const pinInput = document.getElementById('pinInput');

    toggleBtn?.addEventListener('click', () => {
      if (pinInput.type === 'password') {
        pinInput.type = 'tel';
        toggleBtn.textContent = '🙈';
      } else {
        pinInput.type = 'password';
        toggleBtn.textContent = '👁';
      }
    });

    // Handle PIN submit
    document.getElementById('pinForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputPin = document.getElementById('pinInput').value.trim();
      const fails = Number(sessionStorage.getItem(FAIL_KEY) || 0);

      // 🔐 Prevent further PIN checks after lockout
      if (fails >= MAX_PIN_ATTEMPTS) {
        alert("PIN entry locked. Please use the 'Forgot PIN' option.");
        return;
      }

      if (inputPin === data.pin) {
        resetSessionFlags();
        pinPrompt.innerHTML = '';
        detailsCard.classList.remove('hidden');
      } else {
        const updatedFails = registerFail();
        alert(`Incorrect PIN (${updatedFails}/3).`);
        if (updatedFails >= MAX_PIN_ATTEMPTS) {
          showForgotOption();
        }
      }
    });
  }

  function showForgotOption() {
    const pinForm = document.getElementById('pinForm');
    if (!pinForm) return;

    const warn = document.createElement('p');
    warn.textContent = 'Too many attempts. You can now reset your partner details.';
    warn.style.color = '#f88';
    warn.style.marginTop = '0.75em';
    warn.style.fontWeight = '600';

    const forgotBtn = document.createElement('button');
    forgotBtn.id = 'forgotPinBtn';
    forgotBtn.type = 'button';
    forgotBtn.className = 'menu-btn';
    forgotBtn.style.backgroundColor = '#f88';
    forgotBtn.style.marginTop = '1em';
    forgotBtn.innerHTML = `
      <img src="./assets/forgot.png" class="menu-icon" alt="Forgot PIN" />
      <span>Forgot PIN?</span>
    `;
    forgotBtn.addEventListener('click', () => {
      if (confirm('⚠️ This will permanently erase your partner details.')) {
        localStorage.removeItem('partnerDetails');
        resetSessionFlags();
        location.reload();
      }
    });

    pinForm.appendChild(warn);
    pinForm.appendChild(forgotBtn);
  }
});