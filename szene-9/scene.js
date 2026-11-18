'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const sentences = [
    ['Der König blieb stehen,', 'obwohl er Kinder nicht mochte.'],
    ['Leise sagte sie:', 'Ihr habt es gesehen …'],
    ['Etwas an Elins Stimme', 'machte ihn nachdenklich.']
  ];
  const original = [
    'Der König schnaubte. Er drehte sich um und rief nach seinen Pferden. Einer der Diener ließ vor Schreck eine Samtkiste fallen. Der Deckel landete im Schlamm. Sie machten sich auf, zurückzureiten.',
    'Am Rand des Weges stand ein Mädchen. Elin. Sie hatte wirres Haar, Sommersprossen und einen grünen Fleck auf dem Knie. Wahrscheinlich Gras. Vielleicht auch Suppe vom Vorabend.',
    '„Ihr habt es gesehen“, murmelte sie ihnen leise hinterher. „Aber ihr habt nicht hingeschaut.“',
    'Der König blieb stehen.',
    'Er mochte es nicht, wenn man so mit ihm redete. Und er mochte keine Kinder. Sie stellten Fragen, wenn man seine Ruhe wollte, und waren klebrig, ohne dass sich feststellen ließ, warum. Aber etwas im Tonfall des Mädchens machte ihn stutzig.'
  ].join('\n\n');
  const cards = [[], []];
  let selection = null;
  const speech = createStorySpeech(updateSpeech);

  function show(section) {
    for (const id of ['reading', 'activity', 'listening']) {
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
      byId('finish').hidden = false;
      byId('finish').focus();
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
    byId('finish').hidden = true;
  }

  function updateSpeech() {
    const labels = {
      playing: 'Pause',
      paused: 'Weiterhören',
      ended: 'Noch einmal hören',
      error: 'Erneut vorlesen'
    };
    byId('listen').textContent = labels[speech.state] || 'Geschichte vorlesen';
    byId('listen').disabled = !speech.available;
    byId('speechStatus').textContent = !speech.available
      ? 'Auf diesem Gerät ist das Vorlesen nicht verfügbar.'
      : speech.state === 'error' ? 'Die Vorlesestimme konnte nicht starten.' : '';
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

  byId('start').onclick = () => show('activity');
  byId('back').onclick = () => show('reading');
  byId('finish').onclick = () => show('listening');
  byId('listen').onclick = () => speech.toggle(original);
  byId('retry').onclick = () => {
    speech.stop();
    resetActivity();
    show('activity');
  };
  window.addEventListener('pagehide', () => speech.stop());
  updateSpeech();

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

  try {
    const key = 'silvana-visited-scenes-v1';
    localStorage.setItem(key, String(Math.max(9, Number(localStorage.getItem(key)) || 0)));
  } catch {
    // Die Szene ist auch ohne gespeicherten Besuch spielbar.
  }
})();
