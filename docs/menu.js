window.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.electronAPI.goToHome();
    });
  }

  // Handle emoji buttons
  document.querySelector('.text-btn')?.addEventListener('click', () => {
    window.electronAPI.goToText();
  });

  document.querySelector('.call-btn')?.addEventListener('click', () => {
    window.electronAPI.goToCall();
  });

  document.querySelector('.hug-btn')?.addEventListener('click', () => {
    window.electronAPI.goToHug();
  });

  document.querySelector('.food-btn')?.addEventListener('click', () => {
    window.electronAPI.goToHungry();
  });
});