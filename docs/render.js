window.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.goToMenu();  // Electron mode
      } else {
        window.location.href = './menu.html';  // Web mode
      }
    });
  }

  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.goToHome();
      } else {
        window.location.href = './index.html';
      }
    });
  }
});