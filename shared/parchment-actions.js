'use strict';

(() => {
  const controlSelector = [
    'button:is(.primary, .secondary, .quiet, .answer, .word-option, .zoom-open, #closeZoom)',
    '.welcome .start',
    '#main summary',
    'button:has(> video[hidden]):has(> span:not([hidden]))'
  ].join(', ');
  const groupSelector = '#main, .topbar, .welcome, dialog, [data-parchment-group]';
  const probe = document.createElement('div');
  probe.className = 'parchment-measure';
  probe.setAttribute('aria-hidden', 'true');
  document.body.append(probe);
  let sizingFrame;

  function labelsFor(control) {
    if (control.querySelector(':scope > video')) {
      return [control.querySelector(':scope > span').textContent.trim(), 'Weiter', '▶ Animation abspielen'];
    }
    return [control.textContent.trim(), ...(control.dataset.actionLabel?.split('|') ?? [])];
  }

  function sizeActions() {
    for (const group of document.querySelectorAll(groupSelector)) {
      const controls = Array.from(group.querySelectorAll(controlSelector))
        .filter(control => control.closest(groupSelector) === group);
      const matches = new Set(controls);
      for (const control of group.querySelectorAll('[data-parchment]:has(> video)')) {
        if (control.closest(groupSelector) === group && !matches.has(control)) {
          control.removeAttribute('data-parchment');
        }
      }
      for (const control of controls) control.setAttribute('data-parchment', '');
      const visible = controls.filter(control => control.getClientRects().length);
      if (!visible.length) continue;

      const labels = new Set(visible.flatMap(labelsFor));
      const style = getComputedStyle(visible[0]);
      probe.style.font = style.font;
      probe.style.padding = style.padding;
      probe.style.width = 'max-content';
      const required = Math.max(...Array.from(labels, label => {
        probe.textContent = label;
        return probe.getBoundingClientRect().width;
      }));
      group.style.setProperty('--parchment-width', Math.ceil(required + 1) + 'px');
      // The narrowest layout slot sets the shared limit, including in nested columns.
      const width = Math.min(...visible.map(control => parseFloat(getComputedStyle(control).width)));
      group.style.setProperty('--parchment-width', width + 'px');
      probe.style.width = width + 'px';
      const height = Math.max(56, ...Array.from(labels, label => {
        probe.textContent = label;
        return probe.getBoundingClientRect().height;
      }));
      group.style.setProperty('--parchment-height', Math.ceil(height + 1) + 'px');
    }
  }

  function scheduleSizing() {
    cancelAnimationFrame(sizingFrame);
    sizingFrame = requestAnimationFrame(sizeActions);
  }

  new MutationObserver(records => {
    if (records.some(record => !probe.contains(record.target))) scheduleSizing();
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['hidden', 'open']
  });
  window.addEventListener('resize', scheduleSizing);
  window.addEventListener('pageshow', scheduleSizing);
  document.getElementById('textSize')?.addEventListener('input', scheduleSizing);
  document.fonts?.ready.then(scheduleSizing);
  scheduleSizing();
})();
