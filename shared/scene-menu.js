'use strict';

(() => {
  const menu = document.querySelector('.scene-menu[data-scene]');
  const nav = menu.querySelector('nav');
  const current = Number(menu.dataset.scene);
  const titles = [
    'Die Geschichte beginnt', 'Die vier Straßen', 'Die Spinnen im Wald', 'Der Händler',
    'Der König', 'Im Dorf', 'Der König im Wald', 'Der wütende König', 'Elin',
    '1. Erkenntnis', 'Der Zauber geht vorbei', 'Rückreise', 'Zu Hause', '2. Erkenntnis'
  ];
  const key = 'silvana-visited-scenes-v1';

  function updateMenu() {
    let highest = current;
    try {
      highest = Math.max(current, Number(localStorage.getItem(key)) || 0);
      if (current > 1) localStorage.setItem(key, String(highest));
    } catch {
      // Ohne Zugriff auf den Speicher gilt der Fortschritt der aktuellen Seite.
    }
    for (let number = 1; number <= Math.min(highest, titles.length); number++) {
      const id = 'sceneMenu' + number;
      if (document.getElementById(id)) continue;
      const link = document.createElement('a');
      link.id = id;
      link.href = number === 1 ? '../vorschau-einfuehrung/' : '../szene-' + number + '/';
      link.textContent = titles[number - 1];
      if (number === current) link.setAttribute('aria-current', 'page');
      nav.append(link);
    }
  }

  updateMenu();
  menu.addEventListener('toggle', () => { if (menu.open) updateMenu(); });
  window.addEventListener('pageshow', updateMenu);
})();
