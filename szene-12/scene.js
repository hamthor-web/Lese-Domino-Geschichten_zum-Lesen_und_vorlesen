'use strict';

(() => {
  const answers = [
    ['Die Kisten sind voller Netze.', false],
    ['Eine Kiste war schmutzig.', true],
    ['Lange Zeit später war der König wieder in seinem Schloss.', false],
    ['Niemand hatte Lust zum Putzen.', true],
    ['Die Kisten hatten innen roten Samt.', true],
    ['Niemand wartete auf ihn.', false]
  ];
  const byId = id => document.getElementById(id);
  const original = [
    'Auf der Rückreise blieben die Samtkisten leer. Eine war noch immer voller Schlamm, weil niemand Lust gehabt hatte, sie sauber zu machen.',
    'Als der König einige Tage später seinen Palast erreichte, wartete der Hof bereits auf den berühmten Schatz.'
  ].join('\n\n');
  const speech = createStorySpeech(updateSpeech);
  const pool = byId('thumbs');
  const parchment = byId('statements');
  const evidence = byId('evidence');
  const evidenceHome = evidence.parentElement;
  const taskReading = byId('taskReading');
  const feedback = byId('feedback');
  const completion = byId('completion');
  const next = byId('nextScene');
  const video = byId('transitionVideo');
  const fallback = byId('transitionFallback');
  let selected;
  let drag;
  let placed = 0;
  let attempt = 0;
  let sizingFrame;

  function sizeButtons() {
    cancelAnimationFrame(sizingFrame);
    sizingFrame = requestAnimationFrame(() => {
      const buttons = ['settingsToggle', 'start', 'listen', 'retry'].map(byId);
      buttons.forEach(button => {
        button.style.width = 'max-content';
        button.style.height = 'auto';
      });
      const visible = buttons.filter(button => button.getClientRects().length);
      const available = Math.min(...visible.map(button => {
        const parent = button.parentElement;
        const style = getComputedStyle(parent);
        return parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      }));
      const width = Math.min(available, Math.ceil(Math.max(...visible.map(button => button.getBoundingClientRect().width))));
      visible.forEach(button => { button.style.width = width + 'px'; });
      const height = Math.ceil(Math.max(...visible.map(button => button.getBoundingClientRect().height)));
      visible.forEach(button => { button.style.height = height + 'px'; });
    });
  }

  function select(tile) {
    selected?.setAttribute('aria-pressed', 'false');
    selected = tile;
    selected?.setAttribute('aria-pressed', 'true');
  }

  function makeButton(className, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    return button;
  }

  function reset() {
    SilvanaProgress.checkpoint('activity');
    attempt++;
    placed = 0;
    select(null);
    video.pause();
    speech.stop();
    completion.hidden = true;
    evidenceHome.append(evidence);
    evidence.open = false;
    feedback.hidden = true;
    taskReading.replaceChildren(...Array.from(byId('readingText').children, p => p.cloneNode(true)));
    document.querySelector('.trip-game').hidden = false;
    document.querySelector('.trip-instructions').hidden = false;
    pool.replaceChildren(...[true, false, false, true, false, true, true, false].map(value => {
      const tile = makeButton('thumb', value ? '👍' : '👎');
      tile.dataset.value = String(value);
      tile.setAttribute('aria-label', value ? 'Daumen hoch, wahr' : 'Daumen runter, falsch');
      tile.setAttribute('aria-pressed', 'false');
      tile.onclick = () => select(selected === tile ? null : tile);
      tile.onpointerdown = startDrag;
      return tile;
    }));
    parchment.replaceChildren(...answers.map(([text], index) => {
      const row = document.createElement('li');
      const button = makeButton('statement', '');
      const label = document.createElement('span');
      label.textContent = text;
      const icon = document.createElement('span');
      icon.className = 'answer-icon';
      icon.setAttribute('aria-hidden', 'true');
      button.append(label, icon);
      button.dataset.index = index;
      button.onclick = () => {
        if (selected) place(selected, button);
        else {
          feedback.textContent = 'Wähle zuerst einen Daumen aus der Kiste.';
          feedback.hidden = false;
        }
      };
      row.append(button);
      return row;
    }));
    byId('activityTitle').focus();
    sizeButtons();
  }

  function place(tile, target, point) {
    if (tile.disabled || target.disabled) return;
    const index = Number(target.dataset.index);
    const [, expected] = answers[index];
    select(null);
    const oldMark = taskReading.querySelector('mark');
    if (oldMark) oldMark.replaceWith(oldMark.textContent);
    if (String(expected) !== tile.dataset.value) {
      const sentence = taskReading.querySelector('[data-evidence~="' + index + '"]');
      const mark = document.createElement('mark');
      mark.textContent = sentence.textContent;
      sentence.replaceChildren(mark);
      feedback.textContent = 'Schau dir die markierte Stelle im Text an.';
      feedback.hidden = false;
      target.parentElement.append(evidence);
      evidence.open = true;
      spinBack(tile, point || target.getBoundingClientRect());
      return;
    }

    feedback.hidden = true;
    if (oldMark) {
      evidenceHome.append(evidence);
      evidence.open = false;
    }
    tile.classList.add('used');
    tile.disabled = true;
    target.querySelector('.answer-icon').textContent = tile.textContent;
    target.setAttribute('aria-label', answers[index][0] + (expected ? ' Wahr.' : ' Falsch.'));
    target.disabled = true;
    if (++placed === answers.length) finish();
    else pool.querySelector('.thumb:not(:disabled)').focus({preventScroll: true});
  }

  function previewOf(tile) {
    const preview = document.createElement('span');
    preview.className = 'thumb thumb-preview';
    preview.textContent = tile.textContent;
    preview.setAttribute('aria-hidden', 'true');
    document.body.append(preview);
    return preview;
  }

  function spinBack(tile, from) {
    const to = tile.getBoundingClientRect();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const preview = previewOf(tile);
    preview.style.left = from.x + 'px';
    preview.style.top = from.y + 'px';
    tile.style.opacity = '0';
    tile.disabled = true;
    const animation = preview.animate([
      {transform: 'translate(0, 0) rotate(0turn)'},
      {transform: 'translate(' + (to.x - from.x) + 'px, ' + (to.y - from.y) + 'px) rotate(1turn)'}
    ], {duration: 520, easing: 'ease-in-out'});
    animation.onfinish = () => {
      preview.remove();
      tile.style.opacity = '';
      if (!tile.classList.contains('used')) tile.disabled = false;
    };
  }

  function startDrag(event) {
    if (event.button !== 0 || drag) return;
    const tile = event.currentTarget;
    drag = {id: event.pointerId, tile, startX: event.clientX, startY: event.clientY};
    tile.setPointerCapture(event.pointerId);
  }

  function trackDrag() {
    if (!drag?.preview) return;
    const {x, y, preview} = drag;
    const edge = 58;
    if (y < edge) window.scrollBy(0, -12);
    if (y > innerHeight - edge) window.scrollBy(0, 12);
    const target = document.elementFromPoint(x, y)?.closest('.statement:not(:disabled)');
    if (drag.target !== target) {
      drag.target?.classList.remove('target');
      target?.classList.add('target');
      drag.target = target;
    }
    preview.style.left = x - preview.offsetWidth / 2 + 'px';
    preview.style.top = y - preview.offsetHeight / 2 + 'px';
    drag.frame = requestAnimationFrame(trackDrag);
  }

  window.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.preview && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 7) {
      select(drag.tile);
      drag.preview = previewOf(drag.tile);
      trackDrag();
    }
  });
  function releaseDrag(event, cancelled) {
    if (drag?.id !== event.pointerId) return;
    const {tile, preview, target, frame} = drag;
    drag = null;
    if (!preview) return;
    const point = preview.getBoundingClientRect();
    cancelAnimationFrame(frame);
    preview.remove();
    target?.classList.remove('target');
    const suppressClick = event => event.stopImmediatePropagation();
    tile.addEventListener('click', suppressClick, {capture: true, once: true});
    setTimeout(() => tile.removeEventListener('click', suppressClick, true), 0);
    const destination = document.elementFromPoint(event.clientX, event.clientY)?.closest('.statement:not(:disabled)');
    if (!cancelled && destination) place(tile, destination, point);
    else select(null);
  }
  window.addEventListener('pointerup', event => releaseDrag(event, false));
  window.addEventListener('pointercancel', event => releaseDrag(event, true));

  function ready(failed) {
    if (completion.hidden) return;
    video.hidden = failed;
    fallback.hidden = !failed;
    fallback.textContent = 'Weiter';
    next.disabled = false;
    next.setAttribute('aria-label', 'Weiter zur nächsten Szene');
    next.onclick = () => location.assign('../szene-13/');
  }

  function playTransition() {
    const current = attempt;
    video.hidden = false;
    fallback.hidden = true;
    next.disabled = true;
    next.setAttribute('aria-label', 'Würstchen-Animation läuft');
    video.currentTime = 0;
    video.play().catch(error => {
      if (current !== attempt) return;
      if (error.name === 'NotAllowedError') {
        video.hidden = true;
        fallback.textContent = 'Animation abspielen';
        fallback.hidden = false;
        next.setAttribute('aria-label', fallback.textContent);
        next.onclick = playTransition;
        next.disabled = false;
      } else ready(true);
    });
  }

  function finish() {
    SilvanaProgress.finish(12);
    SilvanaProgress.checkpoint('finish');
    document.querySelector('.trip-game').hidden = true;
    document.querySelector('.trip-instructions').hidden = true;
    completion.hidden = false;
    byId('finishTitle').focus();
    sizeButtons();
    if (!video.getAttribute('src')) video.src = 'assets/weiter-zu-szene-13.mp4';
    playTransition();
  }

  function updateSpeech() {
    const labels = {playing: 'Ⅱ Pause', paused: '▶ Weiterhören', ended: '↻ Noch einmal hören', error: 'Erneut vorlesen'};
    byId('listen').textContent = labels[speech.state] || 'Geschichte vorlesen';
    byId('listen').disabled = !speech.available;
    const status = byId('speechStatus');
    status.textContent = !speech.available ? 'Auf diesem Gerät ist das Vorlesen nicht verfügbar.'
      : speech.state === 'error' ? 'Die Vorlesestimme konnte nicht starten.' : '';
    status.hidden = !status.textContent;
    sizeButtons();
  }

  byId('listen').onclick = () => speech.toggle(original);
  SilvanaProgress.addReading(byId('listen'), original);
  window.addEventListener('pagehide', () => speech.stop());
  updateSpeech();

  video.onended = () => ready(false);
  video.onerror = () => ready(true);
  byId('start').onclick = () => {
    byId('reading').hidden = true;
    byId('activity').hidden = false;
    reset();
  };
  byId('retry').onclick = reset;

  const settings = byId('settings');
  byId('settingsToggle').onclick = () => {
    settings.hidden = !settings.hidden;
    byId('settingsToggle').setAttribute('aria-expanded', String(!settings.hidden));
  };
  for (const name of ['text', 'board']) {
    const slider = byId(name + 'Size');
    slider.oninput = () => {
      document.documentElement.style.setProperty('--' + name, Number(slider.value) / 100);
      byId(name + 'Output').textContent = slider.value + ' %';
      sizeButtons();
    };
  }
  window.addEventListener('resize', sizeButtons);
  document.fonts?.ready.then(sizeButtons);
  SilvanaProgress.connect('reading', screen => {
    speech.stop();
    video.pause();
    byId('reading').hidden = screen !== 'reading';
    byId('activity').hidden = screen === 'reading';
    if (screen === 'finish') finish();
    if (screen === 'activity' && !completion.hidden) reset();
    sizeButtons();
  });
})();
