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

  function updateMenu() {
    const completed = SilvanaProgress.completed().sort((a, b) => a - b);
    const note = nav.querySelector('.note');
    note.textContent = completed.length
      ? 'Wähle eine abgeschlossene Szene.'
      : 'Hier erscheinen die Szenen, sobald du ihre Aufgaben abgeschlossen hast.';
    nav.replaceChildren(note);
    for (const number of completed) {
      const link = document.createElement('a');
      link.id = 'sceneMenu' + number;
      link.href = number === 1 ? '../vorschau-einfuehrung/' : '../szene-' + number + '/';
      link.textContent = titles[number - 1];
      if (number === current) link.setAttribute('aria-current', 'page');
      nav.append(link);
    }
  }

  updateMenu();
  menu.addEventListener('toggle', () => { if (menu.open) updateMenu(); });
  addEventListener('pageshow', updateMenu);
  addEventListener('silvana-progress', updateMenu);
  addEventListener('storage', updateMenu);

  const markReading = () => {
    document.querySelectorAll('summary').forEach(summary => {
      if (!['Originaltext zum Mitlesen', 'Geschichte mitlesen'].includes(summary.textContent.trim())) return;
      if (summary.parentElement.classList.contains('story-reading')) return;
      summary.textContent = 'Geschichte mitlesen';
      summary.parentElement.classList.add('story-reading');
    });
  };
  markReading();
  new MutationObserver(markReading).observe(document.querySelector('main'), {childList: true, subtree: true});
})();
