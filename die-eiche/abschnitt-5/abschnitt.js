'use strict';

const media = '../../assets/die-eiche/abschnitt-5/';
const readings = [
  'In der nächsten Woche scheint die Sonne noch wärmer. Das Eis auf dem See schmilzt.',
  'Kleine Fische schwimmen nach oben. Sie schnappen nach Fliegen.',
  'Die Knospen an den Zweigen wachsen weiter. Bald sieht man grüne Spitzen. Dann kommt der erste Frühlingsregen. Die Knospen gehen auf. Kleine hellgrüne Blätter kommen heraus. Zuerst sind sie noch faltig. Dann strecken sie sich ins Sonnenlicht.'
];
const original = 'In der nächsten Woche begann die Sonne noch kräftiger zu scheinen. Der See verlor seinen Eispanzer, lustige kleine Fische schauten an der Oberfläche vorbei und schnappten nach den ersten Fliegen, die sich vorwitzig zu sehr genähert hatten. Und die Knospen der Eiche wurden immer dicker. Die ersten grünen Schimmer zeigten sich schon an ihren Spitzen. Und nach dem ersten Frühlingsregen kamen die Blätter ganz zum Vorschein: erst zart hellgrün und klein, ein bisschen zerknittert noch, dann streckten sie sich voller Lebenslust ins Licht.';
const questions = {
  1: {title: 'Wahr oder falsch?', text: 'Das Eis auf dem See schmilzt.', choices: ['Falsch', 'Wahr'], correct: 1},
  3: {title: 'Wonach schnappen die Fische?', choices: ['Brot', 'Fliegen', 'Steine'], correct: 1},
  5: {title: 'Ergänze den Satz', text: 'Die Blätter sind zuerst noch ___.', choices: ['blau', 'laut', 'faltig'], correct: 2},
  6: {title: 'Ergänze den Satz', text: 'Man sieht ___ Spitzen.', choices: ['graue', 'grüne', 'große'], correct: 1},
  7: {title: 'Ergänze den Satz', text: 'Sie strecken sich ins ___.', choices: ['List', 'Licht', 'Leicht'], correct: 1}
};
const corrections = [
  {image: 'korrektur-baeume.webp', area: [0, 0, 100, 39]},
  {image: 'korrektur-see.webp', area: [32, 49, 68, 51]},
  {image: 'korrektur-fische.webp', area: [71, 75, 29, 25]},
  {image: 'korrektur-initialen.webp', area: [21, 39, 10, 13]}
];
const films = {
  2: {file: 'fisch.mp4', label: 'Ein Fisch springt aus dem See und schnappt nach einer Fliege.'},
  4: {file: 'knospe.mp4', label: 'Die Knospe öffnet sich und ein grünes Blatt entfaltet sich.'}
};
const differencePage = 8;
const readingPage = 9;
const lastPage = 10;
const section = 5;
const byId = id => document.getElementById(id);
const screen = byId('screen');
const back = byId('back');
const next = byId('next');
const film = byId('springVideo');
const filmToggle = byId('filmToggle');
const seek = byId('filmSeek');
const filmTime = byId('filmTime');
const formatTime = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const speech = createStorySpeech(() => {
  const feedback = byId('speechFeedback');
  if (feedback) feedback.textContent = speech.state === 'error'
    ? 'Die Vorlesestimme ist gerade nicht verfügbar. Du kannst die Geschichte mitlesen.'
    : '';
});

function restore() {
  const saved = EicheProgress.readForVisit(section);
  return {
    page: Number.isInteger(saved?.page) && saved.page >= 0 && saved.page <= lastPage ? saved.page : 0,
    answers: Object.keys(questions).map(Number).filter(page => Array.isArray(saved?.answers) && saved.answers.includes(page)),
    found: corrections.map((_, index) => index).filter(index => Array.isArray(saved?.found) && saved.found.includes(index))
  };
}

let state = restore();

function save() {
  EicheProgress.save(section, state);
}

function goTo(page) {
  speech.stop();
  film.pause();
  byId('bookClip')?.pause();
  state.page = page;
  save();
  render();
  byId('stepTitle').focus({preventScroll: true});
  window.scrollTo(0, 0);
}

function paper(title, text = '') {
  return '<div class="paper"><h2 id="stepTitle" tabindex="-1">' + title + '</h2>' +
    (text ? '<p>' + text + '</p>' : '') + '</div>';
}

function drawQuestion(question) {
  const solved = state.answers.includes(state.page);
  screen.innerHTML = paper(question.title, question.text) +
    '<div class="choices">' + question.choices.map((choice, index) =>
      '<button type="button" class="game-button" data-answer="' + index + '">' + choice + '</button>'
    ).join('') + '</div><p class="feedback" id="feedback" role="status"></p>';
  updateAnswer(question, solved);
}

function updateAnswer(question, solved) {
  if (solved) {
    if (question.text?.includes('___') && !screen.querySelector('.filled')) {
      const line = screen.querySelector('.paper p');
      line.innerHTML = question.text.replace('___', '<span class="filled">' + question.choices[question.correct] + '</span>');
    }
    screen.querySelector('[data-answer="' + question.correct + '"]').setAttribute('aria-pressed', 'true');
    byId('feedback').textContent = 'Richtig!';
  }
  next.disabled = !solved;
}

function drawDifferences() {
  const overlays = corrections.map(({image}, index) =>
    '<img class="patch" data-patch="' + index + '" src="' + media + image + '" alt="">'
  ).join('');
  // Smaller targets sit above the lake so that overlapping areas remain selectable.
  const targets = [1, 0, 2, 3].map(index => {
    const [x, y, width, height] = corrections[index].area;
    return '<button type="button" class="hit" data-find="' + index + '" aria-label="Bildbereich ' + (index + 1) +
      '" style="left:' + x + '%;top:' + y + '%;width:' + width + '%;height:' + height + '%"></button>';
  }).join('');
  screen.innerHTML = paper('Finde die Fehler', 'Tippe auf die vier Unterschiede.') +
    '<div class="image-pair"><div class="search-scene"><img src="' + media + 'fruehling.webp" alt="Frühlingsbild als Vorlage"></div>' +
    '<div class="search-scene"><img src="' + media + 'suchbild.webp" alt="Frühlingsbild mit vier Unterschieden">' +
    overlays + targets + '</div></div><p class="feedback" id="foundCount" role="status"></p>';
  updateDifferences();
}

function updateDifferences() {
  for (const index of state.found) {
    screen.querySelector('[data-patch="' + index + '"]').classList.add('visible');
    screen.querySelector('[data-find="' + index + '"]').hidden = true;
  }
  byId('foundCount').textContent = state.found.length + ' von ' + corrections.length + ' gefunden';
  next.disabled = state.found.length !== corrections.length;
}

function drawReading() {
  screen.innerHTML = paper('Mach es dir gemütlich und höre der Geschichte zu', original) +
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

function updateFilmControl() {
  const ready = Number.isFinite(film.duration) && film.duration > 0;
  filmToggle.textContent = film.ended ? 'Noch einmal ansehen' : film.paused ? 'Abspielen' : 'Pause';
  seek.disabled = !ready;
  seek.value = ready ? Math.round(film.currentTime / film.duration * 1000) : 0;
  filmTime.value = formatTime(film.currentTime) + (ready ? ' / ' + formatTime(film.duration) : '');
}

function playFilm() {
  film.play().catch(updateFilmControl);
}

function render() {
  const page = state.page;
  const clip = films[page];
  byId('art').hidden = Boolean(clip) || page >= differencePage;
  byId('film').hidden = !clip;
  byId('layout').classList.toggle('wide', page >= differencePage);
  byId('layout').classList.toggle('film-layout', Boolean(clip));
  film.classList.toggle('bud', page === 4);
  if (clip) {
    film.src = media + clip.file;
    film.setAttribute('aria-label', clip.label);
    if (!motion.matches) playFilm();
    updateFilmControl();
  } else if (film.hasAttribute('src')) {
    film.removeAttribute('src');
    film.load();
  }

  byId('counter').textContent = (page + 1) + ' / ' + (lastPage + 1);
  back.disabled = page === 0;
  next.hidden = false;
  next.disabled = false;
  next.textContent = page === lastPage ? 'Abschnitt noch einmal' : 'Weiter';

  if (page === 0 || clip) screen.innerHTML = paper('Lies selbst', readings[page / 2]);
  else if (questions[page]) drawQuestion(questions[page]);
  else if (page === differencePage) drawDifferences();
  else if (page === readingPage) drawReading();
  else {
    EicheProgress.complete(section);
    drawBook();
  }
}

screen.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-answer')) {
    const question = questions[state.page];
    if (Number(button.dataset.answer) === question.correct) {
      if (!state.answers.includes(state.page)) {
        state.answers.push(state.page);
        save();
      }
      updateAnswer(question, true);
    } else if (!state.answers.includes(state.page)) {
      byId('feedback').textContent = 'Lies noch einmal genau. Versuch es noch einmal.';
    }
  } else if (button.hasAttribute('data-find')) {
    const index = Number(button.dataset.find);
    if (state.found.includes(index)) return;
    state.found.push(index);
    save();
    updateDifferences();
    if (event.detail === 0) (screen.querySelector('.hit:not([hidden])') || next).focus();
  } else if (button.dataset.speech === 'start') speech.start(original);
  else if (button.dataset.speech === 'stop') speech.stop();
});

for (const event of ['loadedmetadata', 'play', 'pause', 'ended', 'timeupdate', 'seeked']) {
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

back.addEventListener('click', () => goTo(state.page - 1));
next.addEventListener('click', () => {
  if (state.page < lastPage) goTo(state.page + 1);
  else if (window.confirm('Abschnitt noch einmal beginnen?')) {
    state = {page: 0, answers: [], found: []};
    goTo(0);
  }
});
addEventListener('pagehide', () => {
  speech.stop();
  film.pause();
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
