'use strict';

(() => {
  const rounds = [
    {word: 'SONNE', letters: 'NOSEN', image: 'sonne', alt: 'Die Sonne über dem Wald'},
    {word: 'TROPFEN', letters: 'FNETOPR', image: 'tropfen', alt: 'Ein Wassertropfen am Haselblatt'},
    {word: 'GRAU', letters: 'UAGR', image: 'grau', alt: 'Ein grauer Kieselstein im Moos'},
    {word: 'DÜNN', letters: 'NNDÜ', image: 'duenn', alt: 'Ein dünner Faden zwischen zwei Zweigen'},
    {word: 'SPINNE', letters: 'NISENP', image: 'spinne', alt: 'Eine Spinne auf einem Haselzweig'},
    {word: 'FLIEGE', letters: 'EGFELI', image: 'fliege', alt: 'Eine Fliege auf einem Haselblatt'}
  ];
  const original = [
    'Hinter ihnen verlagerte ein Pferd ungeduldig sein Gewicht. Der kranke Diener würgte leise hinter einer Buche. Niemand sagte etwas dazu.',
    'Die Sonne stieg höher. Das Netz verlor sein Glitzern, Tropfen für Tropfen. Bald war nur noch das Gespinst zwischen den Zweigen zu erkennen. Grau. Dünn. Mit der dicken Spinne und einer hilflosen kleinen Fliege darin.',
    '„Und jetzt?“, fragte der König. Elin zuckte mit den Schultern.'
  ].join('\n\n');
  const byId = id => document.getElementById(id);
  const fall = byId('fall');
  const fallStage = byId('fallStage');
  const playFall = byId('playFall');
  const puzzle = byId('puzzle');
  const slots = byId('slots');
  const letters = byId('letters');
  const feedback = byId('feedback');
  const clue = byId('clue');
  const completion = byId('completion');
  const finishActions = byId('finishActions');
  const next = byId('nextScene');
  const transition = byId('transitionVideo');
  const fallback = byId('transitionFallback');
  let speech;
  let index = 0;
  let finishCount = 0;
  let phase = 'reading';
  let selected;
  let mistakes = 0;
  let drag;

  function select(tile) {
    selected?.setAttribute('aria-pressed', 'false');
    selected = tile;
    selected?.setAttribute('aria-pressed', 'true');
  }

  function playDrop() {
    playFall.hidden = true;
    const current = index;
    fall.play().catch(error => {
      if (phase !== 'fall' || current !== index) return;
      if (error.name === 'NotAllowedError') {
        playFall.hidden = false;
        playFall.focus();
      } else if (error.name !== 'AbortError') {
        showPuzzle();
      }
    });
  }

  function startDrop() {
    phase = 'fall';
    SilvanaProgress.checkpoint('fall:' + index);
    puzzle.hidden = true;
    completion.hidden = true;
    fallStage.hidden = false;
    const source = 'assets/tropfen-' + (index + 1) + '.mp4';
    if (index === 0) fall.setAttribute('poster', 'assets/netz.webp');
    else fall.removeAttribute('poster');
    if (fall.getAttribute('src') !== source) fall.src = source;
    else fall.currentTime = 0;
    playDrop();
  }

  function showPuzzle() {
    if (phase !== 'fall') return;
    phase = 'puzzle';
    SilvanaProgress.checkpoint('puzzle:' + index);
    mistakes = 0;
    const {word, letters: shuffled, image, alt} = rounds[index];
    fallStage.hidden = true;
    clue.src = 'assets/' + image + '.webp';
    clue.alt = alt;
    feedback.textContent = '';
    slots.replaceChildren(...Array.from(word, (_, position) => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'letter-slot';
      slot.dataset.position = position;
      slot.setAttribute('aria-label', 'Buchstabenplatz ' + (position + 1));
      slot.onclick = () => place(selected, slot);
      return slot;
    }));
    letters.replaceChildren(...Array.from(shuffled, letter => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'letter-tile';
      tile.textContent = letter;
      tile.setAttribute('aria-pressed', 'false');
      tile.onclick = () => select(selected === tile ? null : tile);
      tile.onpointerdown = beginDrag;
      tile.onpointermove = moveDrag;
      tile.onpointerup = endDrag;
      tile.onlostpointercapture = cancelDrag;
      return tile;
    }));
    puzzle.querySelector('details').open = false;
    puzzle.hidden = false;
    if (!puzzle.contains(document.activeElement)) letters.firstElementChild.focus({preventScroll: true});
  }

  function place(tile, slot) {
    if (phase !== 'puzzle' || slot.disabled) return;
    if (!tile) {
      feedback.textContent = 'Wähle zuerst einen Buchstaben.';
      return;
    }
    const word = rounds[index].word;
    select(null);
    if (tile.textContent !== word[Number(slot.dataset.position)]) {
      mistakes += 1;
      if (mistakes === 1) {
        feedback.textContent = 'Schau noch einmal genau hin.';
        tile.focus({preventScroll: true});
        return;
      }
      const openSlot = slots.querySelector('button:not(:disabled)');
      const position = Number(openSlot.dataset.position);
      const hint = word[position];
      const label = 'Auf Platz ' + (position + 1) + ' gehört ' + hint + '.';
      feedback.textContent = 'Schau noch einmal genau hin. ' + label;
      tile.focus({preventScroll: true});
      return;
    }

    slot.textContent = tile.textContent;
    slot.setAttribute('aria-label', 'Buchstabenplatz ' + (Number(slot.dataset.position) + 1) + ', ' + tile.textContent);
    slot.disabled = true;
    tile.disabled = true;
    const remaining = letters.querySelector('button:not(:disabled)');
    if (remaining) {
      feedback.textContent = '';
      remaining.focus({preventScroll: true});
      return;
    }
    phase = 'solved';
    feedback.textContent = word + ' – richtig!';
    const solvedIndex = index;
    setTimeout(() => {
      if (phase !== 'solved' || index !== solvedIndex) return;
      index += 1;
      if (index < rounds.length) startDrop();
      else showFinish();
    }, 1100);
  }

  function beginDrag(event) {
    if (!event.isPrimary || event.button !== 0 || drag || phase !== 'puzzle') return;
    const tile = event.currentTarget;
    drag = {tile, id: event.pointerId, x: event.clientX, y: event.clientY};
    tile.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (!drag.preview) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) return;
      drag.preview = document.createElement('span');
      drag.preview.className = 'magic-drag';
      drag.preview.textContent = drag.tile.textContent;
      drag.preview.setAttribute('aria-hidden', 'true');
      document.body.append(drag.preview);
      select(drag.tile);
      drag.frame = requestAnimationFrame(trackDrag);
    }
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.preview.style.left = drag.x + 'px';
    drag.preview.style.top = drag.y + 'px';
  }

  function trackDrag() {
    if (drag.y < 48) window.scrollBy(0, -9);
    if (drag.y > innerHeight - 48) window.scrollBy(0, 9);
    drag.target?.classList.remove('is-over');
    drag.target = targetAt(drag.x, drag.y);
    drag.target?.classList.add('is-over');
    drag.frame = requestAnimationFrame(trackDrag);
  }

  function targetAt(x, y) {
    return document.elementFromPoint(x, y)?.closest('.letter-slot:not(:disabled)');
  }

  function clearDrag() {
    cancelAnimationFrame(drag.frame);
    drag.preview?.remove();
    drag.target?.classList.remove('is-over');
    drag = null;
  }

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    const {preview, tile} = drag;
    clearDrag();
    if (!preview) return;
    const click = tile.onclick;
    tile.onclick = null;
    setTimeout(() => { tile.onclick = click; }, 0);
    const target = targetAt(event.clientX, event.clientY);
    if (target) place(tile, target);
    else select(null);
  }

  function cancelDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (drag.preview) select(null);
    clearDrag();
  }

  function showFinish() {
    phase = 'finish';
    SilvanaProgress.finish(11);
    SilvanaProgress.checkpoint('finish');
    finishCount += 1;
    puzzle.hidden = true;
    completion.hidden = false;
    byId('finishTitle').focus();
    setTimeout(() => {
      if (phase !== 'finish') return;
      finishActions.hidden = false;
      playTransition();
    }, 3000);
  }

  function playTransition() {
    next.disabled = true;
    fallback.hidden = true;
    transition.hidden = false;
    next.setAttribute('aria-label', 'Würstchen-Animation läuft');
    transition.currentTime = 0;
    transition.play().catch(error => {
      if (phase !== 'finish') return;
      if (error.name === 'NotAllowedError') {
        fallback.textContent = 'Animation abspielen';
        fallback.hidden = false;
        next.setAttribute('aria-label', fallback.textContent);
        next.onclick = playTransition;
        next.disabled = false;
      } else {
        readyForNextScene(true);
      }
    });
  }

  function readyForNextScene(failed = false) {
    if (phase !== 'finish' || finishActions.hidden) return;
    transition.hidden = failed;
    fallback.textContent = 'Weiter';
    fallback.hidden = !failed;
    next.setAttribute('aria-label', 'Weiter zur nächsten Szene');
    next.disabled = false;
    next.onclick = async () => {
      next.disabled = true;
      const currentFinish = finishCount;
      try {
        const response = await fetch('../szene-12/index.html', {method: 'HEAD', cache: 'no-store'});
        if (phase !== 'finish' || currentFinish !== finishCount) return;
        if (response.ok) {
          location.assign('../szene-12/');
          return;
        }
      } catch {
        // Bei fehlender Verbindung bleibt die Szene bedienbar.
      }
      if (phase !== 'finish' || currentFinish !== finishCount) return;
      next.disabled = false;
      const status = byId('transitionStatus');
      status.textContent = 'Hier geht die Geschichte bald weiter.';
      status.hidden = false;
    };
  }


  fall.onended = showPuzzle;
  fall.onerror = showPuzzle;
  playFall.onclick = playDrop;
  transition.onended = () => readyForNextScene();
  transition.onerror = () => readyForNextScene(true);
  speech = mountStoryReading(byId('storyEnd'), original, {id: 'listen', statusId: 'speechStatus'});
  window.addEventListener('pagehide', () => speech.stop());
  byId('taskReading').append(...Array.from(byId('readingText').children, p => p.cloneNode(true)));

  byId('start').onclick = () => {
    byId('reading').hidden = true;
    byId('activity').hidden = false;
    byId('activityTitle').focus();
    startDrop();
  };
  byId('retry').onclick = () => {
    phase = 'reset';
    finishActions.hidden = true;
    transition.pause();
    speech.stop();
    byId('transitionStatus').hidden = true;
    index = 0;
    byId('activityTitle').focus();
    startDrop();
  };

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

  byId('back').onclick = () => location.assign(SilvanaProgress.previousScene(10));
  SilvanaProgress.connect('reading', screen => {
    speech.stop();
    fall.pause();
    transition.pause();
    byId('reading').hidden = screen !== 'reading';
    byId('activity').hidden = screen === 'reading';
    phase = 'reading';
    if (screen === 'reading') return;
    if (screen === 'finish') { fallStage.hidden = true; showFinish(); return; }
    completion.hidden = true;
    index = Number(screen.split(':')[1]);
    if (screen.startsWith('fall:')) startDrop();
    else { phase = 'fall'; showPuzzle(); }
  }, 11);
})();
