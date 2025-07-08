/*──────────────────────────────────────────────────────────────*/
/*  Attention-App index page logic                              */
/*──────────────────────────────────────────────────────────────*/

const FAIL_KEY         = 'pinFailCount';   // sessionStorage key
const MAX_PIN_ATTEMPTS = 3;                // lock threshold

/* helper – increment counter, return new value */
function registerFail () {
  const c = Number(sessionStorage.getItem(FAIL_KEY) || 0) + 1;
  sessionStorage.setItem(FAIL_KEY, String(c));
  return c;
}
/* helper – reset counter + validation */
function resetSessionFlags () {
  sessionStorage.removeItem('pinFailCount');
  sessionStorage.removeItem('pinValidated');
}

function formatNZ(phone) {
  /* 021234567 → +64 21 234 567  |  +6421234567 → +64 21 234 567 */
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

  partnerContainer.innerHTML = '';
  if (menuContainer) menuContainer.innerHTML = '';
  if (forgotContainer) forgotContainer.innerHTML = '';
  if (pinPrompt) pinPrompt.innerHTML = '';
  detailsCard.style.display = 'none';

  // Get stored partner data
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem('partnerDetails'));
  } catch { /* ignore */ }

  const hasDetails = data && data.firstName && data.lastName && data.phone;
  const skipPin = sessionStorage.getItem('pinValidated') === 'true';

  if (!hasDetails) {
    // New user
    partnerContainer.innerHTML = `
      <a href="./partner-details.html" class="menu-btn">
        <img src="./assets/add.png" class="menu-icon" alt="add" />
        <span>Add Partner Details</span>
      </a>`;
    return;
  }

  // Show "Forgot PIN?" button
  function renderResetButton() {
    forgotContainer.innerHTML = `
      <button id="forgotPinBtn" class="menu-btn" style="background-color:#f88;">
        <img src="./assets/forgot.png" class="menu-icon" alt="Forgot PIN" />
        <span>Forgot PIN?</span>
      </button>`;
    document.getElementById('forgotPinBtn')?.addEventListener('click', () => {
      if (confirm('⚠️ This will permanently erase your partner details.')) {
        localStorage.removeItem('partnerDetails');
        resetSessionFlags();
        location.reload();
      }
    });
  }

  // Ask for PIN if not validated this session
  if (!skipPin && data.pin) {
    pinPrompt.innerHTML = `
      <form id="pinForm" style="text-align:center; margin-top: 1em;">
        <label for="pinInput"><strong>Enter your 4-digit PIN:</strong></label><br/>
        <input type="password" id="pinInput" maxlength="4" style="padding: 0.5em; width: 8em; margin-top: 0.5em;" pattern="\\d{4}" required />
        <br/>
        <button type="submit" class="menu-btn" style="margin-top: 1em;">
          <img src="./assets/unlock.png" alt="Unlock" class="menu-icon" />
          <span>Unlock</span>
        </button>
      </form>
    `;
    document.getElementById('pinForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputPin = document.getElementById('pinInput').value.trim();
      if (inputPin === data.pin) {
        resetSessionFlags();
        sessionStorage.setItem('pinValidated', 'true');
        location.reload();
      } else {
        const fails = registerFail();
        alert(`Incorrect PIN (${fails}/3).`);
        if (fails >= 3) {
          renderResetButton();
          const warn = document.createElement('p');
          warn.textContent = 'You can now reset your partner details using the button above.';
          warn.style.color = '#f88';
          warn.style.marginTop = '0.5em';
          warn.style.fontWeight = '600';
          pinPrompt.appendChild(warn);
        }
      }
    });
    return;
  }

  // Show data
  pdName.textContent = `${data.firstName} ${data.lastName}`;

  let formattedPhone = data.phone;
  if (/^0\d{8,9}$/.test(data.phone)) {
    formattedPhone = '+64 ' + data.phone.slice(1).replace(/(\d{2})(\d{3})(\d{3,4})/, '$1 $2 $3');
  } else if (/^\+64\d{8,9}$/.test(data.phone)) {
    formattedPhone = data.phone.replace(/^\+64(\d{2})(\d{3})(\d{3,4})$/, '+64 $1 $2 $3');
  }
  pdPhone.textContent = formattedPhone;

  detailsCard.style.display = 'block';

  partnerContainer.innerHTML = `
    <a href="#" class="menu-btn" id="viewBtn">
      <img src="./assets/add.png" class="menu-icon" alt="view" />
      <span>View Partner Details</span>
    </a>`;

  if (menuContainer) {
    menuContainer.innerHTML = `
      <a href="./menu.html" class="menu-btn">
        <img src="./assets/menu.png" class="menu-icon" alt="menu" />
        <span>Go to Menu</span>
      </a>`;
  }

  document.getElementById('viewBtn')?.addEventListener('click', () => {
    detailsCard.style.display = detailsCard.style.display === 'block' ? 'none' : 'block';
  });
});
