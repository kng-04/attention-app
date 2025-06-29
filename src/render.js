const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      ipcRenderer.send('navigate-to-menu');
    });
  }
});
