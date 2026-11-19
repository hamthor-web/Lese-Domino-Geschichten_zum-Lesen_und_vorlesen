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
      if (number === current) {
        link.setAttribute('aria-current', 'page');
        link.addEventListener('click', () => {
          if (link.href === location.href) history.replaceState(null, '');
        });
      }
      nav.append(link);
    }
  }

  updateMenu();
  menu.addEventListener('toggle', () => { if (menu.open) updateMenu(); });
  addEventListener('pageshow', updateMenu);
  addEventListener('silvana-progress', updateMenu);
  addEventListener('storage', updateMenu);

  const main = document.getElementById('main');
  const probe = document.createElement('div');
  probe.className = 'action-size-probe';
  probe.setAttribute('aria-hidden', 'true');
  document.body.append(probe);
  let sizingFrame;

  function sizeActions() {
    const actions = Array.from(main.querySelectorAll(
      'button:is(.primary, .secondary, .step):not(#back, #again, #retry, :has(video))'
    )).filter(button => button.getClientRects().length);
    if (!actions.length) return;

    const labels = actions.flatMap(button => button.dataset.actionLabel?.split('|') ?? button.textContent.trim());
    const style = getComputedStyle(actions[0]);
    probe.style.fontFamily = style.fontFamily;
    probe.style.fontSize = style.fontSize;

    probe.style.width = 'max-content';
    const width = Math.max(52, ...labels.map(label => {
      probe.textContent = label;
      return probe.offsetWidth + 2;
    }));
    main.style.setProperty('--action-width', width + 'px');

    const availableWidth = Math.min(...actions.map(button => button.offsetWidth));
    main.style.setProperty('--action-width', availableWidth + 'px');
    probe.style.width = availableWidth + 'px';
    const height = Math.max(52, ...labels.map(label => {
      probe.textContent = label;
      return probe.offsetHeight + 2;
    }));
    main.style.setProperty('--action-height', height + 'px');
  }

  function scheduleSizing() {
    cancelAnimationFrame(sizingFrame);
    sizingFrame = requestAnimationFrame(sizeActions);
  }

  new MutationObserver(scheduleSizing).observe(main, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open']
  });
  window.addEventListener('resize', scheduleSizing);
  document.getElementById('textSize')?.addEventListener('input', scheduleSizing);
  document.fonts?.ready.then(scheduleSizing);
  scheduleSizing();
})();
