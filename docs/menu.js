window.addEventListener('DOMContentLoaded', () => {
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
    window.location.href = './cuddles.html';
  });

  document.querySelector('.food-btn')?.addEventListener('click', () => {
    window.location.href = './hungry.html';
  });
});
