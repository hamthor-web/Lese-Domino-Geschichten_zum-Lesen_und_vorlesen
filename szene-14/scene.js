'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const board = byId('board');
  const glowVideo = byId('glowVideo');
  const sparkle = byId('sparkle');
  const tray = byId('pieces');
  const feedback = byId('feedback');
  const rotate = byId('rotate');
  const answers = [...byId('answers').querySelectorAll('button')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pictureSize = 1254;
  // Ausschnitte der gelieferten transparenten PNGs im zusammengesetzten Bild.
  const frames = [
    [0, 0, 418, 743], [302, 0, 650, 627], [836, 0, 418, 743],
    [0, 627, 534, 627], [418, 511, 418, 743], [720, 627, 534, 627]
  ];
  const places = ['oben links', 'oben in der Mitte', 'oben rechts',
    'unten links', 'unten in der Mitte', 'unten rechts'];
  let selected = null;
  let drag = null;

  const pieces = frames.map((frame, index) => {
    const image = new Image();
    image.src = 'assets/teil-' + (index + 1) + '.webp';
    image.alt = '';
    image.draggable = false;
    const button = document.createElement('button');
    button.className = 'piece';
    button.type = 'button';
    button.setAttribute('aria-label', 'Puzzleteil ' + (index + 1));
    button.append(image);

    const target = document.createElement('button');
    target.type = 'button';
    target.className = 'target';
    target.dataset.index = index;
    target.setAttribute('aria-label', 'Platz ' + places[index]);
    byId('targets').append(target);

    const piece = {index, frame, button, target, image, turns: 0};
    button.onclick = event => {
      if (!piece.justDragged || event.detail === 0) select(piece);
    };
    button.onpointerdown = event => beginDrag(event, piece);
    button.onpointermove = moveDrag;
    button.onpointerup = endDrag;
    button.onpointercancel = cancelDrag;
    button.onlostpointercapture = cancelDrag;
    target.onclick = () => place(index);
    return piece;
  });

  function select(piece) {
    if (selected) selected.button.setAttribute('aria-pressed', 'false');
    selected = piece;
    if (piece) piece.button.setAttribute('aria-pressed', 'true');
    rotate.disabled = !piece;
    feedback.textContent = '';
  }

  function updateTurn(piece) {
    piece.button.style.setProperty('--turn', (piece.turns * 90) + 'deg');
  }

  function start() {
    SilvanaProgress.checkpoint('activity');
    cancelDrag();
    stopSpeech();
    select(null);
    board.classList.remove('revealed', 'use-still');
    sparkle.hidden = true;
    glowVideo.classList.remove('is-playing');
    glowVideo.pause();
    if (glowVideo.readyState) glowVideo.currentTime = 0;
    byId('assembled').hidden = true;
    byId('placed').replaceChildren();
    byId('targets').hidden = false;
    byId('tray').hidden = false;
    byId('instructions').hidden = false;
    byId('question').hidden = true;
    byId('ending').hidden = true;
    byId('questionTitle').hidden = false;
    byId('sceneFooter').hidden = false;
    byId('answers').hidden = false;
    answers.forEach(answer => { answer.disabled = false; });
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.every((piece, index) => piece.index === index)) shuffled.push(shuffled.shift());
    for (const piece of shuffled) {
      piece.turns = 1 + Math.floor(Math.random() * 3);
      piece.button.hidden = false;
      piece.target.disabled = false;
      updateTurn(piece);
    }
    tray.replaceChildren(...shuffled.map(piece => piece.button));
    byId('reading').hidden = true;
    byId('activity').hidden = false;
    byId('instructions').focus();
  }

  function place(index, ghost) {
    if (!selected) {
      feedback.textContent = 'Wähle zuerst ein Puzzleteil.';
      return;
    }
    if (selected.index !== index || selected.turns % 4) {
      const message = selected.index === index ? 'Drehe das Teil noch ein Stück.' : 'Probiere einen anderen Platz.';
      returnPiece(ghost);
      feedback.textContent = message;
      return;
    }
    const {button, target, image, frame} = selected;
    const placed = image.cloneNode();
    const [left, top, width, height] = frame.map(value => (value / pictureSize * 100) + '%');
    Object.assign(placed.style, {left, top, width, height});
    byId('placed').append(placed);
    ghost?.remove();
    select(null);
    button.hidden = true;
    target.disabled = true;
    if (pieces.every(piece => piece.target.disabled)) {
      showQuestion();
    } else if (document.activeElement === document.body || document.activeElement === target) {
      tray.querySelector('.piece:not([hidden])').focus({preventScroll: true});
    }
  }

  function showQuestion() {
    SilvanaProgress.checkpoint('question');
    byId('assembled').hidden = false;
    byId('placed').replaceChildren();
    byId('targets').hidden = true;
    byId('tray').hidden = true;
    byId('instructions').hidden = true;
    byId('question').hidden = false;
    byId('questionTitle').focus();
  }

  function returnPiece(ghost) {
    const {button} = selected;
    if (ghost && !reducedMotion.matches) {
      const box = button.getBoundingClientRect();
      const animation = ghost.animate([
        {left: ghost.style.left, top: ghost.style.top, rotate: '0deg', offset: 0},
        {rotate: '-12deg', offset: .18},
        {rotate: '12deg', offset: .36},
        {left: box.left + box.width / 2 + 'px', top: box.top + box.height / 2 + 'px', rotate: '0deg', offset: 1}
      ], {duration: 400, easing: 'ease-out'});
      animation.finished.then(() => ghost.remove(), () => ghost.remove());
    } else {
      ghost?.remove();
      if (!reducedMotion.matches) button.animate([
        {transform: 'translateX(0)'}, {transform: 'translateX(-8px)'},
        {transform: 'translateX(8px)'}, {transform: 'translateX(0)'}
      ], {duration: 300});
    }
  }

  function beginDrag(event, piece) {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    piece.justDragged = false;
    drag = {id: event.pointerId, piece, x: event.clientX, y: event.clientY, ghost: null};
    piece.button.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (!drag.ghost) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
      select(drag.piece);
      const {button, image, turns} = drag.piece;
      const ghost = document.createElement('div');
      ghost.className = 'drag-piece';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.width = button.offsetWidth + 'px';
      ghost.style.setProperty('--turn', turns * 90 + 'deg');
      ghost.append(image.cloneNode());
      document.body.append(ghost);
      button.style.opacity = '.28';
      drag.ghost = ghost;
    }
    drag.ghost.style.left = event.clientX + 'px';
    drag.ghost.style.top = event.clientY + 'px';
  }

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    const {ghost, piece} = drag;
    drag = null;
    if (!ghost) return;
    piece.justDragged = true;
    piece.button.style.opacity = '';
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.target');
    if (target && !target.disabled) place(Number(target.dataset.index), ghost);
    else {
      returnPiece(ghost);
      feedback.textContent = 'Lege das Teil auf das Puzzelfeld.';
    }
  }

  function cancelDrag(event) {
    if (!drag || (event && drag.id !== event.pointerId)) return;
    drag.ghost?.remove();
    drag.piece.button.style.opacity = '';
    drag = null;
  }

  rotate.onclick = () => {
    if (!selected) return;
    selected.turns++;
    updateTurn(selected);
    feedback.textContent = '';
  };

  glowVideo.addEventListener('playing', () => {
    if (board.classList.contains('revealed')) glowVideo.classList.add('is-playing');
  });
  function showStill() {
    glowVideo.classList.remove('is-playing');
    if (board.classList.contains('revealed')) board.classList.add('use-still');
  }
  glowVideo.addEventListener('error', showStill);

  function playSparkle() {
    if (reducedMotion.matches) {
      showStill();
      return;
    }
    if (glowVideo.readyState) glowVideo.currentTime = 0;
    glowVideo.play().catch(error => {
      if (error.name !== 'AbortError') showStill();
    });
  }

  sparkle.onclick = playSparkle;

  for (const answer of answers) {
    answer.onclick = () => {
      if (!answer.hasAttribute('data-correct')) {
        answer.disabled = true;
        answers.find(option => !option.disabled)?.focus();
        feedback.textContent = 'Überlege noch einmal. Was tat der König, als Elin ihm das Netz zeigte?';
        return;
      }
      SilvanaProgress.finish(14);
      SilvanaProgress.checkpoint('finish');
      feedback.textContent = '';
      byId('questionTitle').hidden = true;
      byId('sceneFooter').hidden = true;
      board.classList.add('revealed');
      sparkle.hidden = false;
      playSparkle();
      byId('answers').hidden = true;
      byId('ending').hidden = false;
      byId('endingTitle').focus({preventScroll: true});
      board.scrollIntoView({block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    };
  }

  let lastSpeech;
  let fullSpeech;

  function stopSpeech() {
    lastSpeech?.stop();
    fullSpeech?.stop();
  }

  fetch('assets/vorlesetext.json')
    .then(response => {
      if (!response.ok) throw new Error('Vorlesetext fehlt');
      return response.json();
    })
    .then(text => {
      lastSpeech = mountStoryReading(byId('lastReading'), text.last, {
        id: 'listenLast', label: 'Szene vorlesen', beforeToggle: () => fullSpeech.stop()
      });
      fullSpeech = mountStoryReading(byId('fullReading'), text.full, {
        id: 'listenFull', title: 'Die ganze Geschichte', label: 'Ganze Geschichte vorlesen',
        statusId: 'fullSpeechStatus', readingId: 'readFull', textId: 'fullStory',
        readingLabel: 'Ganze Geschichte mitlesen', beforeToggle: () => lastSpeech.stop()
      });
    })
    .catch(() => {
      byId('speechStatus').textContent = 'Die Vorlesetexte konnten nicht geladen werden.';
      byId('speechStatus').hidden = false;
    });

  byId('start').onclick = start;
  byId('retry').onclick = start;
  window.addEventListener('pagehide', stopSpeech);

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
    };
  }
  byId('back').onclick = () => location.assign(SilvanaProgress.previousScene(13));
  SilvanaProgress.connect('reading', screen => {
    stopSpeech();
    glowVideo.pause();
    if (screen === 'reading') {
      byId('reading').hidden = false;
      byId('activity').hidden = true;
      return;
    }
    if (screen === 'activity' && byId('question').hidden && tray.childElementCount) {
      byId('reading').hidden = true;
      byId('activity').hidden = false;
      return;
    }
    start();
    if (screen === 'question' || screen === 'finish') showQuestion();
    if (screen === 'finish') answers.find(answer => answer.hasAttribute('data-correct')).onclick();
  }, 14);
})();
