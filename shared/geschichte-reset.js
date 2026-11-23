'use strict';

(() => {
  const isEiche = document.documentElement.dataset.app === 'eiche';
  const title = isEiche ? 'Die Eiche' : 'Silvana';
  const status = document.getElementById('app-status');
  document.getElementById('zuruecksetzen').addEventListener('click', () => {
    if (!confirm('Möchtest du den Spielfortschritt für „' + title + '“ zurücksetzen?')) return;
    try {
      if (isEiche) EicheProgress.reset();
      else SilvanaProgress.reset();
      dispatchEvent(new Event('game-reset'));
      status.textContent = 'Der Spielfortschritt wurde zurückgesetzt.';
    } catch {
      status.textContent = 'Der Spielfortschritt konnte nicht zurückgesetzt werden.';
    }
  });
})();
