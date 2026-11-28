'use strict';

const words = [
  {answer: 'SPECHT', question: 'Welcher Vogel klopft gegen den Baum?', row: 2, column: 0, image: 'specht'},
  {answer: 'SONNE', question: 'Was geht am Abend unter?', row: 6, column: 1, image: 'sonne'},
  {answer: 'EIER', question: 'Was legen die Tauben?', row: 0, column: 2, down: true, image: 'eier'},
  {answer: 'KÜKEN', question: 'Wer schlüpft aus den Eiern?', row: 8, column: 0, image: 'kueken'},
  {answer: 'TAUBEN', question: 'Welche Vögel haben den Streit mit den Krähen gewonnen?', row: 2, column: 5, down: true, image: 'tauben'},
  {answer: 'RINDE', question: 'Wie heißt die raue Haut des Baumes?', row: 4, column: 3, down: true, image: 'rinde'},
  {answer: 'NEST', question: 'Was bauen die Tauben in der Eiche?', row: 0, column: 1, image: 'nest'}
];
const section = 7;
const byId = id => document.getElementById(id);
const crossword = byId('crossword');
const grid = byId('grid');
const feedback = byId('feedback');
const storyDialog = byId('story-dialog');
const readButton = byId('read');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const board = new Map();
const solved = new Set();
const rewardQueue = [];
let showingReward = false;

const speech = createStorySpeech(() => {
  readButton.textContent = speech.state === 'playing' ? 'Vorlesen stoppen' : 'Frage vorlesen';
  if (speech.state === 'error') feedback.textContent = 'Die Vorlesestimme ist gerade nicht verfügbar.';
});
readButton.disabled = !speech.available;
readButton.onclick = () => {
  if (speech.state === 'playing') speech.stop();
  else speech.start(words[selected].question);
};

for (const [index, word] of words.entries()) {
  word.index = index;
  word.cells = Array.from(word.answer, (letter, offset) => {
    const row = word.row + (word.down ? offset : 0);
    const column = word.column + (word.down ? 0 : offset);
    const key = row + ',' + column;
    if (!board.has(key)) board.set(key, {key, row, column, letter, words: []});
    const cell = board.get(key);
    if (cell.letter !== letter) throw new Error('Ungültige Kreuzung bei ' + key);
    cell.words.push(index);
    return cell;
  });
}
grid.style.setProperty('--columns', 2 + Math.max(...Array.from(board.values(), cell => cell.column)));
grid.style.gridTemplateRows = 'repeat(' + (2 + Math.max(...Array.from(board.values(), cell => cell.row))) + ', var(--tile))';

const saved = EicheProgress.readForVisit(section);
let currentPage = saved?.page === 'crossword' ? 'crossword' : 'reading';
let selected = words[saved?.selected]?.index ?? 0;

function letterFrom(value) {
  return String(value ?? '').normalize('NFC').toLocaleUpperCase('de-DE').replace(/[^A-ZÄÖÜẞ]/g, '').slice(-1);
}

for (const cell of board.values()) {
  const box = document.createElement('div');
  box.className = 'cell';
  box.style.gridArea = (cell.row + 2) + ' / ' + (cell.column + 2);
  cell.box = box;
  const starts = cell.words.filter(index => words[index].cells[0] === cell);
  if (starts.length) {
    const number = document.createElement('small');
    number.textContent = starts.map(index => index + 1).join('/');
    number.setAttribute('aria-hidden', 'true');
    box.append(number);
  }

  const input = document.createElement('input');
  input.autocomplete = 'off';
  input.autocapitalize = 'characters';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'Buchstabenfeld ' + (cell.row + 1) + ', ' + (cell.column + 1));
  input.value = letterFrom(saved?.letters?.[cell.key]);
  cell.input = input;

  input.addEventListener('focus', () => {
    if (!cell.words.includes(selected)) select(cell.words.find(index => !solved.has(index)) ?? cell.words[0]);
    input.select();
  });
  input.addEventListener('input', event => {
    if (!event.isComposing) enterLetter(cell);
  });
  input.addEventListener('compositionend', () => enterLetter(cell));
  input.addEventListener('keydown', event => {
    if (event.key !== 'Backspace' || input.value) return;
    const cells = words[selected].cells;
    const previous = cells.slice(0, cells.indexOf(cell)).reverse().find(item => !item.input.readOnly);
    previous?.input.focus();
    if (previous) event.preventDefault();
  });
  box.append(input);
  grid.append(box);
}

for (const word of words) {
  const button = document.createElement('button');
  button.className = 'clue';
  button.type = 'button';
  word.button = button;
  word.imageUrl = '../../assets/die-eiche/abschnitt-7/' + word.image + '.webp';
  button.textContent = (word.index + 1) + '. ' + (word.down ? '↓ ' : '→ ') + word.question;
  button.onclick = () => select(word.index, true);
  byId('clues').append(button);
}

function save() {
  const letters = Object.fromEntries(Array.from(board.values(), cell => [cell.key, cell.input.value]));
  EicheProgress.save(section, {page: currentPage, selected, solved: [...solved], letters});
}

function select(index, focus = false) {
  if (index !== selected) speech.stop();
  selected = index;
  const word = words[index];
  byId('question').textContent = (index + 1) + '. ' + word.question + ' (' + word.answer.length + ' Buchstaben)';
  for (const cell of board.values()) cell.box.classList.toggle('active', cell.words.includes(index));
  for (const item of words) item.button.setAttribute('aria-pressed', String(item === word));
  if (focus) {
    const first = word.cells.find(cell => !cell.input.readOnly && !cell.input.value)
      ?? word.cells.find(cell => !cell.input.readOnly) ?? word.cells[0];
    first.input.focus();
  }
  save();
}

function wordIsCorrect(word) {
  return word.cells.map(cell => cell.input.value).join('') === word.answer;
}

function markSolved(word, animate) {
  solved.add(word.index);
  word.button.classList.add('done');
  word.button.prepend('✓ ');
  for (const cell of word.cells) {
    cell.input.readOnly = true;
    cell.box.classList.add('solved');
  }
  const marker = document.createElement('img');
  marker.className = 'marker';
  marker.src = word.imageUrl;
  marker.alt = word.answer;
  marker.style.gridArea = (word.row + (word.down ? 1 : 2)) + ' / ' + (word.column + (word.down ? 2 : 1));
  if (animate) {
    marker.style.visibility = 'hidden';
    rewardQueue.push({word, marker});
  }
  grid.append(marker);
}

function renderProgress() {
  byId('progress').value = solved.size;
  byId('count').textContent = solved.size + ' von ' + words.length + ' Wörtern gefunden';
  byId('replay').hidden = currentPage !== 'crossword' || solved.size !== words.length;
}

function enterLetter(cell) {
  if (cell.input.readOnly) return;
  cell.input.value = letterFrom(cell.input.value);
  const active = words[selected];
  let found = false;
  for (const word of words) {
    if (!solved.has(word.index) && wordIsCorrect(word)) {
      markSolved(word, true);
      found = true;
    }
  }
  save();

  if (cell.input.value) {
    const next = active.cells.slice(active.cells.indexOf(cell) + 1).find(item => !item.input.readOnly);
    next?.input.focus();
  }
  if (found) {
    renderProgress();
    if (solved.size === words.length) EicheProgress.complete(section);
    void playRewards();
  }
}

function rewardCenter() {
  const boardBounds = grid.getBoundingClientRect();
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? innerWidth;
  const height = viewport?.height ?? innerHeight;
  const size = Math.min(280, width * .7, height * .55);
  return {
    left: Math.max(left, Math.min(left + width - size, boardBounds.left + (boardBounds.width - size) / 2)),
    top: Math.max(top, Math.min(top + height - size, boardBounds.top + (boardBounds.height - size) / 2)),
    width: size,
    height: size
  };
}

function presentReward(image, marker) {
  return new Promise(resolve => {
    let start;
    function draw(now) {
      if (crossword.hidden) {
        resolve();
        return;
      }
      start ??= now;
      const elapsed = now - start;
      const moving = !motion.matches;
      const progress = Math.min(1, Math.max(0, (elapsed - 1500) / 950));
      const eased = progress * progress * (3 - 2 * progress);
      const center = rewardCenter();
      const target = marker.getBoundingClientRect();
      for (const property of ['left', 'top', 'width', 'height']) {
        image.style[property] = (center[property] + (moving ? (target[property] - center[property]) * eased : 0)) + 'px';
      }
      if (elapsed >= (moving ? 2450 : 1500)) resolve();
      else requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });
}

async function playRewards() {
  if (showingReward) return;
  showingReward = true;
  while (rewardQueue.length) {
    const {word, marker} = rewardQueue.shift();
    if (!crossword.hidden) {
      const image = document.createElement('img');
      image.className = 'reward';
      image.alt = '';
      image.src = word.imageUrl;
      feedback.textContent = word.answer + ' ist richtig!';
      document.body.append(image);
      await presentReward(image, marker);
      image.remove();
    }
    marker.style.visibility = '';
  }
  showingReward = false;
  if (solved.size === words.length) feedback.textContent = 'Wunderbar! Du hast alle sieben Wörter gefunden.';
}

function showPage(page, focus = false) {
  currentPage = page;
  const playing = page === 'crossword';
  byId('reading').hidden = playing;
  crossword.hidden = !playing;
  byId('back-to-reading').hidden = !playing;
  if (!playing) speech.stop();
  renderProgress();
  if (focus) {
    byId(playing ? 'crossword-title' : 'reading-title').focus({preventScroll: true});
    document.querySelector('.summer-scene').scrollIntoView({block: 'start'});
  }
  save();
}

for (const word of words) {
  if (wordIsCorrect(word)) markSolved(word, false);
}
if (solved.size === words.length) {
  EicheProgress.complete(section);
  feedback.textContent = 'Wunderbar! Du hast alle sieben Wörter gefunden.';
}
select(selected);
showPage(currentPage);
byId('start-crossword').onclick = () => showPage('crossword', true);
byId('back-to-reading').onclick = () => showPage('reading', true);
byId('reread').onclick = () => {
  speech.stop();
  storyDialog.showModal();
};
byId('story-copy').replaceChildren(...byId('story').cloneNode(true).children);
byId('replay').onclick = () => {
  if (confirm('Abschnitt noch einmal beginnen?')) location.assign('?neu=1');
};
addEventListener('pagehide', () => speech.stop());
