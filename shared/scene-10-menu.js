'use strict';

try {
  if (Number(localStorage.getItem('silvana-visited-scenes-v1')) >= 10) {
    const menu = document.querySelector('.scene-menu nav');
    if (menu) {
      const link = document.createElement('a');
      link.href = '../szene-10/';
      link.textContent = '1. Erkenntnis';
      menu.append(link);
    }
  }
} catch {
  // Ohne gespeicherten Besuch bleibt das Szenenmenü bedienbar.
}
