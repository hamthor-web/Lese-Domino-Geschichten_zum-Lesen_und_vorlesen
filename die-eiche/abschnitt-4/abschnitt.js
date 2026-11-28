'use strict';

const reading = [
  'Ein warmer Sonnenstrahl trifft die Eiche. Er kommt aus dem Süden. Er sagt: Bald ist Frühling!',
  'Langsam wird der Baum wach. In ihm fließt wieder Wasser nach oben. Das Wasser gibt dem Baum Kraft.',
  'An den Spitzen der Zweige kitzelt es. Dort sitzen die ersten Knospen. Sie haben feste braune Jacken an. Diese schützen die Blätter vor Kälte. Aber die Knospen werden schon dicker.'
];
const original = [
  'Gerade hatte die Eiche einen warmen Sonnenstrahl erhascht. Er kam von Süden und kündigte leise, fast schüchtern, den nahenden Frühling an. Sie spürte, wie sich die Säfte in ihr regten und langsam, aber stetig den Schlafsand aus ihren Adern spülten.',
  'An den Enden ihrer Zweige spürte sie ein leichtes Kitzeln. Die ersten Knospen bereiteten sich vor, sich der Sonne entgegenzustrecken. Noch waren sie verborgen in festen, wärmenden braunen Hüllen. Aber sie schwollen schon an.'
];
const words = ['Baum', 'Eiche', 'Kraft', 'Stärke', 'oben', 'hoch', 'wach', 'munter'];
const sentences = ['Ein Sonnenstrahl trifft die Eiche.', 'Der Baum wird wach.', 'Die Knospen werden dicker.'];
const exercises = {
  pairs: {items: words, bank: [3, 4, 1, 6, 2, 7, 0, 5], title: 'Was passt zusammen?'},
  order: {items: sentences, bank: [2, 0, 1], title: 'Was passiert zuerst?'}
};
const questions = {
  ice: {
    title: 'Warum ist Eis auf dem See auf dem Bild?',
    choices: [
      ['Weil es sehr kalt ist.', 'Genau! Bei großer Kälte kann das Wasser auf dem See gefrieren.'],
      ['Weil der Kühlschrank offen stand.', 'Ein offener Kühlschrank macht den See draußen nicht kalt. Schau noch einmal auf das Bild.'],
      ['Weil bald Frühling ist.', 'Wenn es im Frühling wärmer wird, schmilzt das Eis. Wann kann Wasser gefrieren?'],
      ['Weil Winter ist.', '']
    ]
  },
  winter: {
    title: 'Warum ist das nicht immer richtig?',
    prompt: 'Warum reicht „Weil Winter ist“ als Antwort noch nicht? Wähle die zwei richtigen Sätze.',
    choices: [
      ['Auf dem See ist auch im Winter nicht immer Eis.', 'Das stimmt. Auch im Winter kann es milde Tage geben.'],
      ['Es muss kalt genug sein für Eis auf dem See.', 'Richtig. Das Wasser muss kalt genug werden, um zu gefrieren.'],
      ['Im Winter ist nie Eis auf einem See.', 'Schau auf das Bild. Im Winter kann der See zufrieren.'],
      ['Es wurde Sand gestreut.', 'Sand bringt das Wasser nicht zum Gefrieren.']
    ]
  },
  odd: {
    title: 'Was passt nicht?',
    prompt: 'Was hilft der Eiche beim Aufwachen? Tippe auf das, was nicht dazu passt.',
    choices: [
      ['Sonne', 'Die Eiche wird von der Sonne geweckt. Das passt! Was ist wirklich falsch?'],
      ['Wasser', 'Das Wasser stärkt die Eiche. Was passt wirklich nicht?'],
      ['Wärme', 'Die Wärme lässt die Knospen aus ihren Hüllen schauen. Das passt! Was passt wirklich nicht?'],
      ['Schokolade', 'Genau. Aber dem Würstchen schmeckt die Schokolade. Dir auch?']
    ]
  }
};

const iceConversation = [
  {answer: 1, question: 'Warum kann ein offener Kühlschrank den See draußen nicht zufrieren lassen?',
    tip: 'In einem Kühlschrank wird es drinnen kalt. Damit der See zufriert, muss das Wasser draußen kalt genug werden.'},
  {answer: 2, question: 'Was passiert mit dem Eis auf dem See, wenn es im Frühling wärmer wird?',
    tip: 'Wenn es wärmer wird, schmilzt das Eis. Der See ist zugefroren, weil es vorher kalt genug war.'},
  {answer: 3, question: 'Kann es im Winter auch Tage geben, an denen auf dem See kein Eis ist? Warum?',
    tip: 'Auch im Winter gibt es milde Tage. Der See friert erst zu, wenn es lange genug kalt bleibt.'}
];

const byId = id => document.getElementById(id);
const screen = byId('screen');
const next = byId('next');
const video = byId('budVideo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sequence = ['read1', 'ice', 'winter', 'read2', 'pairs', 'read3', 'order', 'film', 'odd', 'listen', 'finish'];
const section = 4;
const fresh = () => ({
  page: 'read1', ice: false, winterVisited: false, winter: [], pairs: Array(8).fill(null),
  order: Array(3).fill(null), pairsSolved: false, orderSolved: false, odd: false, filmStarted: false
});

let state = fresh();
let selected = null;
let drag = null;
let suppressClick = false;
let narration = null;

function restore() {
  const saved = EicheProgress.readForVisit(section);
  if (!saved || !sequence.includes(saved.page)) return;
  for (const key of ['ice', 'winterVisited', 'odd', 'filmStarted']) state[key] = saved[key] === true;
  state.winter = [0, 1].filter(index => Array.isArray(saved.winter) && saved.winter.includes(index));
  for (const [name, exercise] of Object.entries(exercises)) {
    const slots = saved[name];
    const placed = new Set();
    if (!Array.isArray(slots) || slots.length !== exercise.items.length) continue;
    state[name] = slots.map(index => {
      if (!Number.isInteger(index) || !exercise.items[index] || placed.has(index)) return null;
      placed.add(index);
      return index;
    });
    state[name + 'Solved'] = saved[name + 'Solved'] === true && isSolved(name);
  }
  state.page = saved.page === 'winter' && !state.winterVisited ? 'ice' : saved.page;
}

function save() {
  EicheProgress.save(section, state);
}

function route() {
  return state.winterVisited ? sequence : sequence.filter(page => page !== 'winter');
}

function setPage(page) {
  video.pause();
  byId('bookClip')?.pause();
  stopSpeech();
  clearDrag();
  selected = null;
  state.page = page;
  save();
  render();
  byId('stepTitle').focus({preventScroll: true});
  window.scrollTo(0, 0);
}

function paper(title, content = '') {
  return '<div class="paper"><h2 id="stepTitle" tabindex="-1">' + title + '</h2>' + content + '</div>';
}

function status(message) {
  byId('feedback').textContent = message;
}

function render() {
  const page = state.page;
  const pages = route();
  byId('art').hidden = ['pairs', 'film', 'listen', 'finish'].includes(page);
  byId('film').hidden = page !== 'film';
  byId('layout').classList.toggle('wide', byId('art').hidden && page !== 'film');
  byId('layout').classList.toggle('film-layout', page === 'film');
  byId('counter').textContent = (pages.indexOf(page) + 1) + ' / ' + pages.length;
  next.disabled = false;
  next.hidden = false;
  next.textContent = ({
    read1: 'Zur Frage', read2: 'Zum Domino', read3: 'Zur Aufgabe', film: 'Zur Frage',
    odd: 'Zum Vorlesen', listen: 'Zum nächsten Abschnitt', finish: 'Abschnitt noch einmal'
  })[page] || 'Weiter';

  if (page.startsWith('read')) {
    const number = Number(page.at(-1));
    const title = number === 2 ? 'Langsam wird der Baum wach' : 'Lies selbst';
    screen.innerHTML = paper(title, '<p>' + reading[number - 1] + '</p>');
  } else if (questions[page]) {
    drawQuestion(page);
  } else if (exercises[page]) {
    drawExercise(page);
  } else if (page === 'film') {
    screen.innerHTML = paper('Die Eiche wird wach', '<p>Schau auf den Zweig. Die Knospe öffnet sich einen Spalt. Eine grüne Spitze schaut heraus.</p>');
    if (!state.filmStarted && !reducedMotion.matches) {
      video.currentTime = 0;
      playFilm();
    }
  } else if (page === 'listen') {
    screen.innerHTML = paper('Mach es dir gemütlich und höre der Geschichte zu', original.map(text => '<p>' + text + '</p>').join('')) +
      '<div class="read-aloud"><button class="game-button" type="button" data-speech="start">Vorlesen</button>' +
      '<button class="game-button" type="button" data-speech="stop">Stopp</button></div><p class="feedback" id="feedback" role="status"></p>';
  } else {
    drawBookTransition();
    EicheProgress.complete(section);
  }
}

function drawBookTransition() {
  screen.replaceChildren(byId('bookTransition').content.cloneNode(true));
  const clip = byId('bookClip');
  const still = byId('bookStill');
  const title = byId('bookTitle');

  function revealTitle() {
    if (!clip.isConnected || state.page !== 'finish' || !title.hidden) return;
    clip.hidden = true;
    still.hidden = false;
    title.hidden = false;
    next.hidden = false;
  }

  if (reducedMotion.matches) {
    revealTitle();
    return;
  }
  next.hidden = true;
  clip.addEventListener('ended', revealTitle, {once: true});
  clip.addEventListener('error', revealTitle, {once: true});
  clip.play().catch(revealTitle);
}

function drawQuestion(page) {
  const {title, prompt, choices} = questions[page];
  screen.innerHTML = paper(title, prompt ? '<p>' + prompt + '</p>' : '') +
    '<div class="choices" role="group" aria-labelledby="stepTitle">' + choices.map(([label], index) =>
      '<button class="game-button" type="button" data-answer="' + index + '" aria-pressed="false">' + label + '</button>'
    ).join('') + '</div><p class="feedback" id="feedback" role="status"></p>' +
    (page === 'ice' ? iceConversationMarkup() : '');
  updateQuestion(page);
  if (page === 'winter' && state.winter.length === 2) status('Genau. Es muss kalt genug sein, damit auf dem See Eis entsteht.');
  if (page === 'ice' && state.ice) status(choices[0][1]);
  if (page === 'odd' && state.odd) status(choices[3][1]);
}

function iceConversationMarkup() {
  const topics = iceConversation.map(({answer}, index) =>
    '<button class="game-button" type="button" data-topic="' + index + '" aria-pressed="false" aria-controls="conversationPrompt">' +
    questions.ice.choices[answer][0] + '</button>').join('');
  return '<details class="ice-conversation" id="iceConversation" hidden>' +
    '<summary class="game-button">Darüber sprechen</summary>' +
    '<p id="conversationIntro">Such dir eine andere Antwort aus. Erzähl, warum sie nicht passt.</p>' +
    '<div class="choices" role="group" aria-labelledby="conversationIntro">' + topics + '</div>' +
    '<p class="conversation-prompt" id="conversationPrompt" aria-live="polite"></p>' +
    '<details class="conversation-tip" id="conversationTip" hidden>' +
    '<summary>Tipp anzeigen</summary><p id="conversationTipText"></p></details></details>';
}

function showIceTopic(index) {
  const {question, tip} = iceConversation[index];
  for (const button of screen.querySelectorAll('[data-topic]')) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.topic) === index));
  }
  byId('conversationPrompt').textContent = question;
  const tipDetails = byId('conversationTip');
  tipDetails.open = false;
  byId('conversationTipText').textContent = tip;
  tipDetails.hidden = false;
}

function updateQuestion(page) {
  const correct = page === 'ice' ? (state.ice ? [0] : [])
    : page === 'winter' ? state.winter : state.odd ? [3] : [];
  for (const button of screen.querySelectorAll('[data-answer]')) {
    button.setAttribute('aria-pressed', String(correct.includes(Number(button.dataset.answer))));
  }
  next.disabled = correct.length !== (page === 'winter' ? 2 : 1);
  if (page === 'ice') byId('iceConversation').hidden = !state.ice;
}

function answer(index) {
  const page = state.page;
  if (page === 'ice' && index === 3) {
    state.winterVisited = true;
    setPage('winter');
    return;
  }
  if (page === 'ice' && index === 0) {
    state.ice = true;
    state.winterVisited = false;
    byId('counter').textContent = '2 / ' + route().length;
  }
  if (page === 'winter' && index <= 1 && !state.winter.includes(index)) state.winter.push(index);
  if (page === 'odd' && index === 3) state.odd = true;
  save();
  updateQuestion(page);
  status(questions[page].choices[index][1]);
}

function isSolved(name) {
  const slots = state[name];
  if (slots.includes(null)) return false;
  if (name === 'order') return slots.every((card, index) => card === index);
  return slots.every((word, index) => Math.floor(word / 2) === Math.floor(slots[index ^ 1] / 2));
}

function drawExercise(name, focusSelector) {
  const {items, bank, title} = exercises[name];
  const slots = state[name];
  const pairs = name === 'pairs';
  const solved = state[name + 'Solved'];
  const buildSlot = (word, index) => {
    const label = pairs
      ? 'Dominostein ' + (Math.floor(index / 2) + 1) + ', ' + (index % 2 ? 'rechtes' : 'linkes') + ' Feld'
      : 'Satzplatz ' + (index + 1);
    const value = word === null ? '' : items[word];
    const data = word === null ? '' : ' data-word="' + word + '" aria-pressed="' + (selected === word) + '"';
    const style = pairs ? 'slot' : 'slot game-button';
    return '<button type="button" class="' + style + '" data-slot="' + index + '"' + data +
      ' aria-label="' + label + (value ? ', ' + value : ', leer') + '">' + value + '</button>';
  };
  const fields = slots.map(buildSlot);
  const target = pairs
    ? '<div class="dominoes">' + [0, 2, 4, 6].map(index => '<div class="domino">' + fields[index] + fields[index + 1] + '</div>').join('') + '</div>'
    : '<div class="order">' + fields.join('') + '</div>';
  const direction = pairs ? 'Lege passende Wörter auf denselben Dominostein.'
    : 'Ziehe die Sätze in die Reihenfolge der Geschichte.';
  const refrain = pairs ? 'Wörter prüfen' : 'Reihenfolge prüfen';
  const bankStyle = pairs ? 'word-bank' : 'word-bank order-bank';
  screen.innerHTML = paper(title, '<p>' + direction + ' Du kannst auch erst die Karte und dann das Feld antippen.</p>') +
    '<div class="practice"><div class="' + bankStyle + '" role="group" aria-label="Karten">' + bank.filter(word => !slots.includes(word)).map(word =>
      '<button type="button" class="game-button word" data-word="' + word + '" aria-pressed="' + (selected === word) + '">' + items[word] + '</button>'
    ).join('') + '</div>' + target +
    '<button type="button" class="game-button check" data-check' + (slots.includes(null) || solved ? ' hidden' : '') + '>' + refrain + '</button>' +
    '<p class="feedback" id="feedback" role="status"></p></div>';
  next.disabled = !solved;
  if (solved) status(pairs ? 'Genau! Alle Wortpaare passen zusammen.' : 'Genau! So geht die Geschichte der Reihe nach.');
  if (focusSelector) screen.querySelector(focusSelector)?.focus({preventScroll: true});
}

function moveWord(word, index) {
  const slots = state[state.page];
  const previous = slots.indexOf(word);
  if (previous >= 0 && previous !== index) slots[previous] = slots[index];
  slots[index] = word;
  updateSlots('[data-slot="' + index + '"]');
}

function updateSlots(focusSelector) {
  selected = null;
  state[state.page + 'Solved'] = false;
  save();
  drawExercise(state.page, focusSelector);
}

function checkExercise() {
  const name = state.page;
  if (!isSolved(name)) {
    status(name === 'pairs' ? 'Schau dir die Wortpaare noch einmal an. Du kannst die Karten umlegen.'
      : 'Lies die Sätze noch einmal. Was passiert zuerst?');
    return;
  }
  state[name + 'Solved'] = true;
  save();
  drawExercise(name);
  next.focus({preventScroll: true});
}

screen.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (suppressClick && event.detail !== 0) {
    suppressClick = false;
    return;
  }
  if (target.hasAttribute('data-answer')) {
    answer(Number(target.dataset.answer));
  } else if (target.hasAttribute('data-topic')) {
    showIceTopic(Number(target.dataset.topic));
  } else if (target.hasAttribute('data-check')) {
    checkExercise();
  } else if (target.hasAttribute('data-slot')) {
    const index = Number(target.dataset.slot);
    const card = state[state.page][index];
    if (selected !== null && selected !== card) moveWord(selected, index);
    else if (card !== null) {
      state[state.page][index] = null;
      updateSlots('.word[data-word="' + card + '"]');
    }
  } else if (target.hasAttribute('data-word')) {
    const card = Number(target.dataset.word);
    selected = selected === card ? null : card;
    for (const button of screen.querySelectorAll('[data-word]')) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.word) === selected));
    }
  } else if (target.dataset.speech === 'start') {
    startSpeech();
  } else if (target.dataset.speech === 'stop') {
    stopSpeech();
    status('');
  }
});

function destination(event) {
  const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot]');
  return slot && screen.contains(slot) ? slot : null;
}

function clearDrag() {
  drag?.ghost?.remove();
  screen.querySelector('.drop-target')?.classList.remove('drop-target');
  drag = null;
}

screen.addEventListener('pointerdown', event => {
  suppressClick = false;
  const tile = event.target.closest('[data-word]');
  if (!tile || !event.isPrimary || event.button !== 0) return;
  drag = {id: event.pointerId, word: Number(tile.dataset.word), x: event.clientX, y: event.clientY, label: tile.textContent};
});

window.addEventListener('pointermove', event => {
  if (event.pointerId !== drag?.id) return;
  if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
  if (!drag.ghost) {
    drag.ghost = document.createElement('span');
    drag.ghost.className = 'drag-word game-button';
    drag.ghost.textContent = drag.label;
    drag.ghost.setAttribute('aria-hidden', 'true');
    document.body.append(drag.ghost);
  }
  drag.ghost.style.transform = 'translate(' + (event.clientX + 10) + 'px,' + (event.clientY + 10) + 'px)';
  screen.querySelector('.drop-target')?.classList.remove('drop-target');
  destination(event)?.classList.add('drop-target');
});

window.addEventListener('pointerup', event => {
  if (event.pointerId !== drag?.id) return;
  const slot = drag.ghost ? destination(event) : null;
  const word = drag.word;
  suppressClick = Boolean(drag.ghost);
  clearDrag();
  if (slot) moveWord(word, Number(slot.dataset.slot));
});

window.addEventListener('pointercancel', event => {
  if (event.pointerId === drag?.id) clearDrag();
});
window.addEventListener('blur', clearDrag);

function stopSpeech() {
  if (!narration) return;
  narration = null;
  window.speechSynthesis.cancel();
}

function startSpeech() {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    status('Auf diesem Gerät kannst du die Geschichte mitlesen.');
    return;
  }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(original.join(' '));
  utterance.lang = 'de-DE';
  utterance.rate = .85;
  const voice = speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('de'));
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (narration !== utterance) return;
    narration = null;
    status('');
  };
  utterance.onerror = () => {
    if (narration !== utterance) return;
    narration = null;
    status('Die Vorlesestimme ist gerade nicht verfügbar. Du kannst die Geschichte mitlesen.');
  };
  narration = utterance;
  status('Die Stimme deines Geräts liest die Geschichte vor.');
  speechSynthesis.speak(utterance);
}

const filmToggle = byId('filmToggle');
const seek = byId('filmSeek');
const formatTime = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
function updateFilm() {
  const ready = Number.isFinite(video.duration) && video.duration > 0;
  const duration = ready ? video.duration : 0;
  filmToggle.textContent = video.paused ? 'Abspielen' : 'Pause';
  seek.disabled = !ready;
  seek.value = ready ? Math.round(video.currentTime / duration * 1000) : 0;
  byId('filmTime').value = formatTime(video.currentTime) + (ready ? ' / ' + formatTime(duration) : '');
}

function playFilm() {
  video.play().catch(updateFilm);
}

video.controls = false;
byId('film').querySelector('.film-controls').hidden = false;
for (const event of ['loadedmetadata', 'play', 'pause', 'ended', 'timeupdate', 'seeked']) {
  video.addEventListener(event, updateFilm);
}
video.addEventListener('playing', () => {
  if (state.page === 'film' && !state.filmStarted) {
    state.filmStarted = true;
    save();
  }
});
filmToggle.addEventListener('click', () => {
  if (video.paused) {
    if (video.ended) video.currentTime = 0;
    playFilm();
  } else {
    video.pause();
  }
});
byId('filmRestart').addEventListener('click', () => {
  video.currentTime = 0;
  playFilm();
});
seek.addEventListener('input', () => {
  if (!seek.disabled) video.currentTime = Number(seek.value) / 1000 * video.duration;
});

byId('back').addEventListener('click', () => {
  const pages = route();
  const previous = pages[pages.indexOf(state.page) - 1];
  if (previous) setPage(previous);
  else location.assign('../abschnitt-3/');
});
next.addEventListener('click', () => {
  if (state.page === 'finish') {
    state = fresh();
    setPage('read1');
    return;
  }
  const pages = route();
  setPage(pages[pages.indexOf(state.page) + 1]);
});
byId('infoButton').addEventListener('click', () => byId('info').showModal());
const settingsButton = byId('settingsButton');
settingsButton.addEventListener('click', () => {
  const settings = byId('settings');
  settings.hidden = !settings.hidden;
  settingsButton.setAttribute('aria-expanded', String(!settings.hidden));
});
for (const [id, variable, asPercent] of [['letters', '--letters', false], ['boardSize', '--board', true]]) {
  byId(id).addEventListener('input', event => {
    const {value, nextElementSibling} = event.target;
    document.documentElement.style.setProperty(variable, asPercent ? value + '%' : Number(value) / 100);
    nextElementSibling.value = value + ' %';
  });
}

restore();
save();
updateFilm();
render();
