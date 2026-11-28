'use strict';

const reading = 'Die Eiche freut sich über ihre neuen Blätter. Sie ist stolz auf jedes einzelne. Sie liebt ihre Blätter wie eine Mutter ihre Kinder. Wenn der Wind weht, rauschen die Blätter laut. Die Eiche ist größer als im letzten Jahr.';
const original = 'Die Eiche sah es mit Vergnügen. Und mit Stolz. Denn sie liebte jedes ihrer Blätter wie eine Mutter ihre Kinder. Wenn der Wind nun durch die Äste fuhr, rauschte sie mächtig und machte sich noch größer, als sie das letzte Jahr gewesen war.';
const parts = ['Schein', 'Mutter', 'grün', 'Eichen', 'Socken', 'Liebe', 'Wolken', 'Baum', 'Sonnen', 'hell'];
const compounds = [
  {first: 'Mutter', second: 'Liebe', word: 'Mutterliebe'},
  {first: 'Eichen', second: 'Baum', word: 'Eichenbaum'},
  {first: 'hell', second: 'grün', word: 'hellgrün'},
  {first: 'Sonnen', second: 'Schein', word: 'Sonnenschein'}
];
const nonsense = ['Wolken', 'Socken'].map(part => parts.indexOf(part));
const reviewPrompts = [
  'Gibt es das?',
  'Hast du schon mal so etwas gesehen?',
  'Das kenne ich gar nicht!',
  'Komisches Wort, oder?',
  'Das ist merkwürdig.',
  'Seltsames Wort, oder?'
];
const byId = id => document.getElementById(id);
const screen = byId('screen');
const next = byId('next');
const back = byId('back');
const film = byId('springVideo');
const filmToggle = byId('filmToggle');
const filmSound = byId('filmSound');
const seek = byId('filmSeek');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const section = 6;
const lastPage = 3;
const speech = createStorySpeech(() => {
  const feedback = byId('speechFeedback');
  if (feedback) {
    feedback.textContent = speech.state === 'error'
      ? 'Die Vorlesestimme ist gerade nicht verfügbar. Du kannst die Geschichte mitlesen.'
      : '';
  }
});

function emptyState() {
  return {page: 0, pairs: [], nonsenseWord: null};
}

function findCompound(first, second) {
  return compounds.find(pair => pair.first === parts[first] && pair.second === parts[second]);
}

function restore() {
  const saved = EicheProgress.readForVisit(section);
  if (!Array.isArray(saved?.pairs)) return emptyState();

  const used = new Set();
  const pairs = saved.pairs.filter(pair => {
    if (!Array.isArray(pair) || pair.length !== 2) return false;
    const [first, second] = pair;
    if (!Number.isInteger(first) || !Number.isInteger(second) ||
        !findCompound(first, second) || used.has(first) || used.has(second)) return false;
    used.add(first);
    used.add(second);
    return true;
  });
  const nonsenseWord = ['Wolkensocken', 'Sockenwolken'].includes(saved.nonsenseWord) ? saved.nonsenseWord : null;
  const canResumeAfterExercise = pairs.length === compounds.length && nonsenseWord;
  const page = canResumeAfterExercise && (saved.page === 2 || saved.page === lastPage)
    ? saved.page : saved.page > 0 ? 1 : 0;
  return {page, pairs, nonsenseWord};
}

let state = restore();
let selected = null;
let attempt = null;
let drag = null;
let ignorePointerClick = false;

function save() {
  EicheProgress.save(section, state);
}

function navigate(page) {
  speech.stop();
  film.pause();
  byId('bookClip')?.pause();
  selected = null;
  attempt = null;
  state.page = page;
  save();
  render();
  byId('stepTitle').focus({preventScroll: true});
  window.scrollTo(0, 0);
}

function paper(title, content = '') {
  return '<div class="paper"><h2 id="stepTitle" tabindex="-1">' + title + '</h2>' + content + '</div>';
}

function drawExercise() {
  screen.innerHTML = paper('Ziehe die Wörter zusammen',
    '<p>Tippe zwei Wörter in der richtigen Reihenfolge an oder ziehe das erste auf das zweite. Aus zwei Karten kannst du ein Quatschwort bauen. Finde es!</p>') +
    '<div class="word-game"><div class="compound-bank" role="group" aria-label="Lose Wörter"></div>' +
    '<div class="compound-results" role="group" aria-label="Zusammengesetzte Wörter"></div>' +
    '<div id="wordAttempt" class="compound-attempt" hidden></div>' +
    '<div id="nonsenseResult" hidden></div>' +
    '<p id="attemptNotice" class="feedback" role="status"></p>' +
    '<p class="feedback" id="feedback" role="status"></p></div>';
  const bank = screen.querySelector('.compound-bank');
  for (const [id, part] of parts.entries()) {
    const button = makeButton(part);
    button.classList.add('compound-part');
    button.dataset.part = id;
    button.setAttribute('aria-pressed', 'false');
    bank.append(button);
  }
  for (const [first, second] of state.pairs) showJoinedWord(first, second);
  if (state.nonsenseWord) showNonsense();
  if (exerciseComplete()) announce('Du hast alle Wörter sortiert.');
  next.disabled = !exerciseComplete();
}

function makeButton(label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-button';
  button.textContent = label;
  return button;
}

function partButton(id) {
  return screen.querySelector('[data-part="' + id + '"]');
}

function exerciseComplete() {
  return state.pairs.length === compounds.length && Boolean(state.nonsenseWord);
}

function showJoinedWord(first, second) {
  partButton(first).hidden = true;
  partButton(second).hidden = true;
  const {word} = findCompound(first, second);
  const button = makeButton(word);
  button.dataset.joined = word;
  screen.querySelector('.compound-results').append(button);
  return button;
}

function showNonsense() {
  for (const id of nonsense) partButton(id).hidden = true;
  const result = byId('nonsenseResult');
  result.replaceChildren(byId(state.nonsenseWord).content.cloneNode(true));
  result.hidden = false;
}

function announce(message) {
  byId('feedback').textContent = message;
}

function select(id) {
  if (selected !== null) partButton(selected).setAttribute('aria-pressed', 'false');
  selected = id;
  if (selected !== null) partButton(selected).setAttribute('aria-pressed', 'true');
}

function reviewAttempt(first, second) {
  attempt = {first, second};
  partButton(first).hidden = true;
  partButton(second).hidden = true;
  screen.querySelector('.compound-bank').inert = true;

  const word = parts[first] + parts[second].toLowerCase();
  const combined = makeButton(word);
  combined.dataset.splitWord = '';
  combined.setAttribute('aria-label', word + ' wieder trennen');
  combined.setAttribute('aria-describedby', 'attemptNotice');
  const questionMark = document.createElement('span');
  questionMark.className = 'clay-question';
  questionMark.setAttribute('aria-hidden', 'true');
  questionMark.textContent = '?';
  const panel = byId('wordAttempt');
  panel.replaceChildren(questionMark, combined);
  panel.hidden = false;
  announce('');
  const prompt = reviewPrompts[Math.floor(Math.random() * reviewPrompts.length)];
  byId('attemptNotice').textContent = 'Lies noch einmal. ' + prompt;
  combined.focus();
}

function resolveAttempt() {
  if (!attempt) return;
  const {first, second} = attempt;
  attempt = null;
  byId('wordAttempt').hidden = true;
  byId('attemptNotice').textContent = '';
  screen.querySelector('.compound-bank').inert = false;
  partButton(first).hidden = false;
  partButton(second).hidden = false;
  partButton(first).focus();
}

function combine(first, second, keyboard = false) {
  select(null);
  if (nonsense.includes(first) && nonsense.includes(second)) {
    state.nonsenseWord = parts[first] + parts[second].toLowerCase();
    showNonsense();
    save();
    next.disabled = !exerciseComplete();
    announce(exerciseComplete() ? 'Du hast alle Wörter sortiert.' : '');
    byId('nonsenseResult').querySelector('figcaption').focus();
    return;
  }

  const pair = findCompound(first, second);
  if (!pair) {
    reviewAttempt(first, second);
    return;
  }

  state.pairs.push([first, second]);
  const joined = showJoinedWord(first, second);
  joined.classList.add('just-joined');
  if (keyboard) joined.focus();
  announce(pair.word + ' ist richtig!' + (exerciseComplete() ? ' Du hast alle Wörter sortiert.' : ''));
  save();
  next.disabled = !exerciseComplete();
}

function drawOriginal() {
  screen.innerHTML = paper('Jetzt höre der Geschichte zu!',
    '<h3 class="story-title">Frühlingsbeginn</h3><p>' + original + '</p>') +
    '<div class="read-aloud"><button type="button" class="game-button" data-speech="start">Vorlesen</button>' +
    '<button type="button" class="game-button" data-speech="stop">Stopp</button></div>' +
    '<p class="feedback" id="speechFeedback" role="status"></p>';
  if (!speech.available) {
    screen.querySelectorAll('[data-speech]').forEach(button => button.disabled = true);
    byId('speechFeedback').textContent = 'Auf diesem Gerät kannst du die Geschichte mitlesen.';
  }
}

function drawBook() {
  screen.replaceChildren(byId('bookTransition').content.cloneNode(true));
  const clip = byId('bookClip');
  next.hidden = true;

  function revealTitle() {
    if (!clip.isConnected || clip.hidden) return;
    clip.hidden = true;
    byId('bookStill').hidden = false;
    byId('bookTitle').hidden = false;
    byId('bookNotice').hidden = false;
    next.hidden = false;
  }

  if (motion.matches) {
    revealTitle();
    return;
  }
  clip.addEventListener('ended', revealTitle, {once: true});
  clip.addEventListener('error', revealTitle, {once: true});
  clip.play().catch(() => {
    if (clip.isConnected && !clip.hidden) clip.controls = true;
  });
}

function render() {
  const page = state.page;
  byId('film').hidden = page !== 0;
  byId('layout').classList.toggle('wide', page !== 0);
  byId('counter').textContent = (page + 1) + ' / ' + (lastPage + 1);
  back.disabled = page === 0;
  next.hidden = false;
  next.disabled = false;
  next.textContent = page === lastPage ? 'Abschnitt noch einmal' : 'Weiter';

  if (page === 0) {
    screen.innerHTML = paper('Lies selbst', '<p>' + reading + '</p>');
    if (!motion.matches) {
      if (film.readyState) film.currentTime = 0;
      playFilm();
    }
    updateFilmControl();
  } else if (page === 1) drawExercise();
  else if (page === 2) drawOriginal();
  else {
    EicheProgress.complete(section);
    drawBook();
  }
}

screen.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-part')) {
    if (ignorePointerClick && event.detail) return;
    const id = Number(button.dataset.part);
    if (selected === id) select(null);
    else if (selected === null) {
      select(id);
      announce('');
    } else combine(selected, id, event.detail === 0);
  } else if (button.hasAttribute('data-split-word')) {
    resolveAttempt();
  } else if (button.dataset.joined) {
    if (!attempt) announce(button.dataset.joined + ' ist richtig!');
  } else if (button.dataset.speech === 'start') speech.start(original);
  else if (button.dataset.speech === 'stop') speech.stop();
});

function dropTarget(event) {
  return document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-part]');
}

screen.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  const button = event.target.closest('[data-part]');
  if (button) {
    ignorePointerClick = false;
    drag = {id: event.pointerId, first: Number(button.dataset.part), x: event.clientX, y: event.clientY};
  }
});

window.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 9) return;
  if (!drag.ghost) {
    select(drag.first);
    const ghost = document.createElement('div');
    ghost.className = 'game-button drag-word';
    ghost.textContent = parts[drag.first];
    ghost.setAttribute('aria-hidden', 'true');
    document.body.append(ghost);
    drag.ghost = ghost;
  }
  drag.ghost.style.transform = 'translate(' + (event.clientX + 10) + 'px,' + (event.clientY + 10) + 'px)';
  drag.target?.classList.remove('drop-target');
  drag.target = dropTarget(event);
  if (drag.target !== partButton(drag.first)) drag.target?.classList.add('drop-target');
});

function finishDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  const {first, ghost, target} = drag;
  drag = null;
  if (!ghost) return;
  ghost.remove();
  target?.classList.remove('drop-target');
  ignorePointerClick = true;
  const destination = event.type === 'pointerup' ? dropTarget(event) : null;
  if (destination && destination !== partButton(first)) combine(first, Number(destination.dataset.part));
  else select(null);
}

window.addEventListener('pointerup', finishDrag);
window.addEventListener('pointercancel', finishDrag);

function formatTime(seconds) {
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

function updateFilmControl() {
  const ready = Number.isFinite(film.duration) && film.duration > 0;
  filmToggle.textContent = film.ended ? 'Noch einmal ansehen' : film.paused ? 'Abspielen' : 'Pause';
  filmSound.textContent = film.muted ? 'Ton an' : 'Ton aus';
  seek.disabled = !ready;
  seek.value = ready ? Math.round(film.currentTime / film.duration * 1000) : 0;
  byId('filmTime').value = formatTime(film.currentTime) + (ready ? ' / ' + formatTime(film.duration) : '');
}

function playFilm() {
  film.play().catch(updateFilmControl);
}

for (const event of ['loadedmetadata', 'play', 'pause', 'ended', 'timeupdate', 'seeked', 'volumechange']) {
  film.addEventListener(event, updateFilmControl);
}
seek.addEventListener('input', () => {
  if (!seek.disabled) film.currentTime = Number(seek.value) / 1000 * film.duration;
});
filmToggle.addEventListener('click', () => {
  if (film.paused) {
    if (film.ended) film.currentTime = 0;
    playFilm();
  } else film.pause();
});

filmSound.addEventListener('click', () => {
  film.muted = !film.muted;
  if (!film.muted && film.paused) {
    if (film.ended) film.currentTime = 0;
    playFilm();
  }
  updateFilmControl();
});

back.addEventListener('click', () => navigate(state.page - 1));
next.addEventListener('click', () => {
  if (state.page < lastPage) navigate(state.page + 1);
  else if (window.confirm('Abschnitt noch einmal beginnen?')) {
    state = emptyState();
    navigate(0);
  }
});
addEventListener('pagehide', () => {
  speech.stop();
  film.pause();
  byId('bookClip')?.pause();
});

byId('infoButton').addEventListener('click', () => byId('info').showModal());
const settings = byId('settings');
byId('settingsButton').addEventListener('click', event => {
  settings.hidden = !settings.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!settings.hidden));
});
for (const [id, variable, percent] of [['letters', '--letters', false], ['boardSize', '--board', true]]) {
  byId(id).addEventListener('input', event => {
    const {value, nextElementSibling} = event.target;
    document.documentElement.style.setProperty(variable, percent ? value + '%' : Number(value) / 100);
    nextElementSibling.value = value + ' %';
  });
}

save();
render();
