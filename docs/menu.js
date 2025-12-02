window.addEventListener('DOMContentLoaded', () => {
  const ACCESS_KEY = 'attentionMenuAccess';
  const ACCESS_CODE = document.body.dataset.accessCode || 'ATTENTION2025';
  const overlay = document.getElementById('accessOverlay');
  const accessForm = document.getElementById('accessForm');
  const accessInput = document.getElementById('accessInput');
  const accessError = document.getElementById('accessError');

  function grantAccess() {
    overlay?.classList.add('hidden');
    localStorage.setItem(ACCESS_KEY, 'granted');
  }

  const alreadyGranted = localStorage.getItem(ACCESS_KEY) === 'granted';
  if (!alreadyGranted) {
    overlay?.classList.remove('hidden');
    accessInput?.focus();
  } else {
    overlay?.classList.add('hidden');
  }

  accessForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!accessInput) {
      return;
    }
    const entered = accessInput.value.trim();
    if (entered === ACCESS_CODE) {
      accessError.textContent = '';
      accessInput.value = '';
      grantAccess();
    } else {
      accessError.textContent = 'Incorrect access code. Please try again.';
      accessInput.value = '';
      accessInput.focus();
    }
  });

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.goToHome();  // For Electron
      } else {
        window.location.href = './index.html';  // For GitHub Pages / browser
      }
    });
  }

  // Optional: Add listeners for the emoji buttons
  document.querySelector('.text-btn')?.addEventListener('click', () => {
    window.location.href = './text.html';
  });

  document.querySelector('.call-btn')?.addEventListener('click', () => {
    window.location.href = './call.html';
  });

  document.querySelector('.hug-btn')?.addEventListener('click', () => {
    window.location.href = './hug.html';
  });

  document.querySelector('.food-btn')?.addEventListener('click', () => {
    window.location.href = './hungry.html';
  });

  document.querySelector('.time-btn')?.addEventListener('click', () => {
    window.open('./time.html', '_blank');
  });
});
