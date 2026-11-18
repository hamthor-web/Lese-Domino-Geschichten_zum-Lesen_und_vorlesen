'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const original = [
    '„Dann zeig mir, was ich übersehen habe.“',
    'Elin ging zu dem Haselstrauch und hockte sich hin. Ohne Rücksicht auf ihren Rock. Der König zögerte kurz, dann ging er ebenfalls in die Knie. Sein Mantel schleifte über den feuchten Boden.',
    'Aus der Nähe sah das Netz anders aus. Die Fäden waren dünner, als er erwartet hatte. Fast nicht vorhanden. Und doch hielten sie das Gewicht der Tropfen. In einem davon stand der Wald auf dem Kopf. In einem anderen spiegelte sich ein winziger Ausschnitt des Himmels. Und in dem Tropfen dort sah er seine Krone funkeln. Winzig.',
    'Ein Tropfen löste sich und fiel lautlos auf den Boden. Dann noch einer.',
    '„Es geht kaputt“, sagte der König. „Nein“, antwortete Elin.',
    'Sie saßen eine Weile nebeneinander.'
  ].join('\n\n');
  const pictures = Array.from(document.querySelectorAll('[data-picture]'));
  const targets = Array.from(document.querySelectorAll('[data-target]'));
  const feedback = byId('feedback');
  const completion = byId('completion');
  const next = byId('nextScene');
  const video = byId('transitionVideo');
  const fallback = byId('transitionFallback');
  const speech = createStorySpeech(updateSpeech);
  let selected = null;
  let drag = null;
  let ignoreClick = false;
  let round = 0;

  function select(picture) {
    selected?.setAttribute('aria-pressed', 'false');
    selected = picture;
    selected?.setAttribute('aria-pressed', 'true');
  }

  function place(target) {
    if (!selected) {
      feedback.textContent = 'Wähle zuerst ein Bild.';
      return;
    }
    const picture = selected;
    select(null);
    if (picture.dataset.picture !== target.dataset.target) {
      feedback.textContent = 'Schau noch einmal genau in den Tropfen.';
      picture.focus({preventScroll: true});
      return;
    }
    target.append(picture.querySelector('img').cloneNode());
    target.disabled = true;
    picture.hidden = true;
    const remaining = pictures.find(item => !item.hidden);
    if (remaining) {
      feedback.textContent = 'Das passt!';
      remaining.focus({preventScroll: true});
      return;
    }
    feedback.textContent = 'Alle drei Bilder passen!';
    byId('pictures').hidden = true;
    byId('instructions').hidden = true;
    byId('readingHelp').hidden = true;
    completion.hidden = false;
    feedback.focus({preventScroll: true});
    playTransition();
  }

  function updateDropTarget() {
    drag.target?.classList.remove('is-over');
    drag.target = document.elementFromPoint(drag.clientX, drag.clientY)?.closest('[data-target]:not(:disabled)');
    drag.target?.classList.add('is-over');
  }

  function scrollWhileDragging() {
    if (drag.clientY < 54) window.scrollBy(0, -10);
    if (drag.clientY > innerHeight - 54) window.scrollBy(0, 10);
    updateDropTarget();
    drag.frame = requestAnimationFrame(scrollWhileDragging);
  }

  function clearDrag() {
    if (drag.frame) cancelAnimationFrame(drag.frame);
    drag.preview?.remove();
    drag.target?.classList.remove('is-over');
    drag = null;
  }

  for (const picture of pictures) {
    picture.onclick = () => {
      if (ignoreClick) return;
      select(selected === picture ? null : picture);
      feedback.textContent = selected ? 'Wähle jetzt das passende Pergament.' : '';
    };
    picture.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
      picture.setPointerCapture(event.pointerId);
    };
    picture.onpointermove = event => {
      if (drag?.id !== event.pointerId) return;
      if (!drag.preview) {
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
        const image = picture.querySelector('img');
        drag.preview = image.cloneNode();
        drag.preview.classList.add('drag-preview');
        drag.preview.style.width = image.clientWidth + 'px';
        document.body.append(drag.preview);
        select(picture);
      }
      drag.clientX = event.clientX;
      drag.clientY = event.clientY;
      drag.preview.style.left = drag.clientX + 'px';
      drag.preview.style.top = drag.clientY + 'px';
      updateDropTarget();
      if (!drag.frame) drag.frame = requestAnimationFrame(scrollWhileDragging);
    };
    picture.onpointerup = event => {
      if (drag?.id !== event.pointerId) return;
      const moved = Boolean(drag.preview);
      const target = drag.target;
      clearDrag();
      if (!moved) return;
      ignoreClick = true;
      setTimeout(() => { ignoreClick = false; }, 0);
      if (target) place(target);
      else select(null);
    };
    picture.onlostpointercapture = event => {
      if (drag?.id === event.pointerId) clearDrag();
    };
  }
  for (const target of targets) target.onclick = () => place(target);

  async function playTransition() {
    const current = round;
    fallback.hidden = true;
    video.hidden = false;
    next.disabled = true;
    next.setAttribute('aria-label', 'Würstchen-Animation läuft');
    video.currentTime = 0;
    try {
      await video.play();
    } catch (error) {
      if (current !== round || completion.hidden) return;
      if (error.name === 'NotAllowedError') {
        fallback.textContent = '▶ Abspielen';
        fallback.hidden = false;
        next.setAttribute('aria-label', 'Würstchen-Animation abspielen');
        next.onclick = playTransition;
        next.disabled = false;
      } else {
        readyForNextScene(true);
      }
    }
  }

  function readyForNextScene(failed = false) {
    if (completion.hidden) return;
    video.hidden = failed;
    fallback.textContent = 'Weiter';
    fallback.hidden = !failed;
    next.setAttribute('aria-label', 'Weiter zur nächsten Szene');
    next.onclick = async () => {
      const current = round;
      next.disabled = true;
      try {
        const response = await fetch('../szene-11/index.html', {method: 'HEAD', cache: 'no-store'});
        if (current !== round) return;
        if (response.ok) {
          location.assign('../szene-11/');
          return;
        }
      } catch {
        // Bei fehlender Verbindung bleibt die Aufgabe bedienbar.
      }
      if (current !== round) return;
      next.disabled = false;
      byId('transitionStatus').textContent = 'Hier geht die Geschichte bald weiter.';
      byId('transitionStatus').hidden = false;
    };
    next.disabled = false;
  }

  function updateSpeech() {
    const labels = {playing: 'Pause', paused: 'Weiterhören', ended: 'Noch einmal hören', error: 'Erneut vorlesen'};
    byId('listen').textContent = labels[speech.state] || 'Geschichte vorlesen';
    byId('listen').disabled = !speech.available;
    const status = byId('speechStatus');
    status.textContent = !speech.available ? 'Auf diesem Gerät ist das Vorlesen nicht verfügbar.'
      : speech.state === 'error' ? 'Die Vorlesestimme konnte nicht starten.' : '';
    status.hidden = !status.textContent;
  }

  function setReadingHelp(open) {
    byId('taskReading').hidden = !open;
    byId('showText').setAttribute('aria-expanded', String(open));
    byId('showText').textContent = open ? 'Lesetext schließen' : 'Zum Lesetext';
  }

  video.addEventListener('ended', () => readyForNextScene());
  video.addEventListener('error', () => readyForNextScene(true));
  byId('listen').onclick = () => speech.toggle(original);
  window.addEventListener('pagehide', () => speech.stop());
  updateSpeech();
  byId('start').onclick = () => {
    byId('reading').hidden = true;
    byId('activity').hidden = false;
    byId('activityTitle').focus();
  };
  byId('taskReading').append(...Array.from(byId('readingText').children, paragraph => paragraph.cloneNode(true)));
  byId('showText').onclick = () => setReadingHelp(byId('taskReading').hidden);
  byId('retry').onclick = () => {
    round++;
    completion.hidden = true;
    video.pause();
    speech.stop();
    byId('transitionStatus').hidden = true;
    setReadingHelp(false);
    feedback.textContent = '';
    byId('pictures').hidden = false;
    byId('instructions').hidden = false;
    byId('readingHelp').hidden = false;
    for (const picture of pictures) picture.hidden = false;
    for (const target of targets) {
      target.querySelector('img')?.remove();
      target.disabled = false;
    }
    byId('activityTitle').focus();
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

  try {
    const key = 'silvana-visited-scenes-v1';
    localStorage.setItem(key, String(Math.max(10, Number(localStorage.getItem(key)) || 0)));
  } catch {
    // Die Szene bleibt ohne gespeicherten Besuch spielbar.
  }
})();
