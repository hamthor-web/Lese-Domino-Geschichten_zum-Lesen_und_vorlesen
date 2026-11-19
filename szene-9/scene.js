'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const sentences = [
    ['Der König blieb stehen,', 'obwohl er Kinder nicht mochte.'],
    ['Leise sagte sie:', 'Ihr habt es gesehen …'],
    ['Etwas an Elins Stimme', 'machte ihn nachdenklich.']
  ];
  const original = [
    'Am Rand des Weges stand ein Mädchen. Elin. Sie hatte wirres Haar, Sommersprossen und einen grünen Fleck auf dem Knie. Wahrscheinlich Gras. Vielleicht auch Suppe vom Vorabend.',
    '„Ihr habt es gesehen“, murmelte sie ihnen leise hinterher. „Aber Ihr habt nicht hingeschaut.“',
    'Der König blieb stehen.',
    'Er mochte es nicht, wenn man so mit ihm redete. Und er mochte keine Kinder. Sie stellten Fragen, wenn man seine Ruhe wollte, und waren klebrig, ohne dass sich feststellen ließ, warum. Aber etwas im Tonfall des Mädchens machte ihn stutzig.'
  ].join('\n\n');
  const cards = [[], []];
  let selection = null;
  let speech;

  function show(section) {
    SilvanaProgress.checkpoint(section);
    for (const id of ['reading', 'activity']) {
      byId(id).hidden = id !== section;
    }
    byId(section + 'Title').focus();
  }

  function selectCard(card) {
    if (selection === card) {
      clearSelection();
      byId('feedback').textContent = '';
      return;
    }
    if (!selection || selection.half === card.half) {
      clearSelection();
      selection = card;
      card.button.setAttribute('aria-pressed', 'true');
      byId('feedback').textContent = card.half === 0
        ? 'Tippe jetzt auf ein Satzende.'
        : 'Tippe jetzt auf einen Satzanfang.';
      return;
    }
    const matches = selection.pair === card.pair;
    clearSelection();
    if (!matches) {
      byId('feedback').textContent = 'Die beiden Teile passen noch nicht zusammen. Lies sie noch einmal.';
      return;
    }

    for (const column of cards) column[card.pair].button.hidden = true;
    const pair = document.createElement('li');
    const [start, end] = sentences[card.pair];
    pair.textContent = start + ' ' + (card.pair === 1 ? '„' + end + '“' : end);
    byId('pairs').append(pair);
    byId('pairs').hidden = false;

    const count = byId('pairs').children.length;
    if (count === sentences.length) {
      byId('feedback').textContent = 'Alle drei Sätze sind richtig verbunden!';
      SilvanaProgress.finish(9);
      SilvanaProgress.checkpoint('finish');
      setCompleted(true);
      byId('feedback').focus();
      startTransition();
    } else {
      byId('feedback').textContent = count + ' von 3 Sätzen verbunden.';
      cards[0].find(item => !item.button.hidden).button.focus();
    }
  }

  function clearSelection() {
    selection?.button.setAttribute('aria-pressed', 'false');
    selection = null;
  }

  function resetActivity() {
    clearSelection();
    for (const card of cards.flat()) card.button.hidden = false;
    byId('pairs').replaceChildren();
    byId('pairs').hidden = true;
    byId('feedback').textContent = '';
    setCompleted(false);
    setReadingHelp(false);
    byId('transition').hidden = true;
    byId('transitionStatus').hidden = true;
    video.pause();
  }

  function setCompleted(completed) {
    for (const id of ['instructions', 'board', 'readingHelp']) byId(id).hidden = completed;
    byId('repeat').hidden = !completed;
  }

  function setReadingHelp(open) {
    byId('taskReading').hidden = !open;
    byId('showText').setAttribute('aria-expanded', String(open));
    byId('showText').textContent = open ? 'Lesetext schließen' : 'Zum Lesetext';
  }


  for (const [half, order] of [[0, [0, 1, 2]], [1, [1, 2, 0]]]) {
    const column = byId(half === 0 ? 'starts' : 'ends');
    for (const pair of order) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'elin-card';
      button.textContent = sentences[pair][half];
      button.setAttribute('aria-pressed', 'false');
      const card = {button, half, pair};
      button.addEventListener('click', () => selectCard(card));
      cards[half][pair] = card;
      column.append(button);
    }
  }

  const transition = byId('transition');
  const next = byId('nextScene');
  const video = byId('transitionVideo');
  const fallback = byId('transitionFallback');
  const transitionStatus = byId('transitionStatus');

  function enableTransition(action, label, fallbackText = '') {
    fallback.textContent = fallbackText;
    fallback.hidden = !fallbackText;
    next.setAttribute('aria-label', label);
    next.onclick = action;
    next.disabled = false;
  }

  function readyForNextScene(fallbackText = '') {
    if (transition.hidden) return;
    enableTransition(async () => {
      next.disabled = true;
      try {
        const response = await fetch('../szene-10/index.html', {method: 'HEAD', cache: 'no-store'});
        if (transition.hidden) return;
        if (response.ok) {
          location.assign('../szene-10/');
          return;
        }
      } catch {
        // Ohne Verbindung bleibt die aktuelle Szene bedienbar.
      }
      if (transition.hidden) return;
      next.disabled = false;
      transitionStatus.textContent = 'Hier geht die Geschichte bald weiter.';
      transitionStatus.hidden = false;
    }, 'Weiter zur nächsten Szene', fallbackText);
  }

  async function startTransition() {
    transition.hidden = false;
    next.disabled = true;
    next.setAttribute('aria-label', 'Würstchen-Animation läuft');
    fallback.hidden = true;
    video.currentTime = 0;
    try {
      await video.play();
    } catch (error) {
      if (transition.hidden) return;
      if (error.name === 'NotAllowedError') {
        enableTransition(startTransition, 'Würstchen-Animation abspielen', '▶ Abspielen');
      } else {
        readyForNextScene('Weiter');
      }
    }
  }

  video.addEventListener('ended', () => readyForNextScene());
  video.addEventListener('error', () => readyForNextScene('Weiter'));
  byId('start').onclick = () => {
    speech.stop();
    show('activity');
  };
  byId('taskReading').append(...Array.from(byId('readingText').children, paragraph => paragraph.cloneNode(true)));
  byId('showText').onclick = () => setReadingHelp(byId('taskReading').hidden);
  byId('retry').onclick = () => {
    speech.stop();
    resetActivity();
    show('activity');
  };
  speech = mountStoryReading(byId('storyEnd'), original, {id: 'listen', statusId: 'speechStatus'});
  window.addEventListener('pagehide', () => speech.stop());

  const settings = byId('settings');
  byId('settingsToggle').onclick = () => {
    settings.hidden = !settings.hidden;
    byId('settingsToggle').setAttribute('aria-expanded', String(!settings.hidden));
  };
  for (const name of ['text', 'board']) {
    const slider = byId(name + 'Size');
    const update = () => {
      document.documentElement.style.setProperty('--' + name, Number(slider.value) / 100);
      byId(name + 'Output').textContent = slider.value + ' %';
    };
    slider.addEventListener('input', update);
    update();
  }

  byId('back').onclick = () => location.assign(SilvanaProgress.previousScene(8));
  SilvanaProgress.connect('reading', screen => {
    speech.stop();
    if (screen === 'reading') { video.pause(); show('reading'); return; }
    show('activity');
    if (screen === 'finish') {
      resetActivity();
      for (let i = 0; i < sentences.length; i++) {
        selectCard(cards[0][i]);
        selectCard(cards[1][i]);
      }
    } else if (!byId('repeat').hidden) resetActivity();
  }, 9);
})();
