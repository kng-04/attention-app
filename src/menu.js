const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      ipcRenderer.send('navigate-to-home');
    });
  }
});
