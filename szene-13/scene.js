'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const reading = byId('reading');
  const activity = byId('activity');
  const completion = byId('completion');
  const bubbles = Array.from(byId('questions').children);
  const rightBubble = bubbles.at(-1);
  const feedback = byId('feedback');
  const next = byId('nextScene');
  const video = byId('transitionVideo');
  const fallback = byId('transitionFallback');
  const transitionStatus = byId('transitionStatus');
  const listen = byId('listen');
  const speech = createStorySpeech(updateSpeech);
  const original = [
    'Auf der Rückreise blieben die Samtkisten leer. Eine war noch immer voller Schlamm, weil niemand Lust gehabt hatte, sie sauber zu machen.',
    'Als der König einige Tage später seinen Palast erreichte, wartete der Hof bereits auf den berühmten Schatz.',
    'Die Königin kam die Treppe herunter, hinter ihr Minister, Händler und zwei gelangweilte Prinzen.',
    '„Nun?“, fragte sie. „Was hast du mitgebracht?“',
    'Der König stieg vom Pferd. An seinem Mantelsaum klebte etwas Moos, inzwischen trocken und bröselig. Er betrachtete die geschlossenen Kisten.'
  ].join('\n\n');
  let questionIndex = 0;
  let attempt = 0;

  function updateSpeech() {
    const labels = {playing: 'Ⅱ Pause', paused: '▶ Weiterhören', ended: '↻ Noch einmal hören', error: 'Erneut vorlesen'};
    listen.textContent = labels[speech.state] || 'Geschichte vorlesen';
    listen.disabled = !speech.available;
    const status = byId('speechStatus');
    status.textContent = !speech.available ? 'Auf diesem Gerät ist das Vorlesen nicht verfügbar.'
      : speech.state === 'error' ? 'Die Vorlesestimme konnte nicht starten.' : '';
    status.hidden = !status.textContent;
  }

  function start() {
    attempt++;
    questionIndex = 0;
    video.pause();
    speech.stop();
    byId('questions').append(rightBubble);
    bubbles.forEach((bubble, index) => {
      bubble.hidden = index !== 0;
      bubble.classList.toggle('current', index === 0);
      bubble.classList.remove('reviewed');
    });
    feedback.textContent = '';
    byId('questionPrompt').textContent = 'Gehört diese Frage zum Lesetext?';
    byId('questionPrompt').hidden = false;
    byId('answerActions').hidden = false;
    byId('textHelp').hidden = false;
    byId('textHelp').open = false;
    byId('telling').hidden = true;
    reading.hidden = true;
    completion.hidden = true;
    activity.hidden = false;
    byId('activityTitle').focus();
  }

  function tell() {
    const from = rightBubble.getBoundingClientRect();
    const queen = byId('queenPicture');
    queen.append(rightBubble);
    byId('questionPrompt').hidden = true;
    byId('answerActions').hidden = true;
    byId('textHelp').hidden = true;
    byId('telling').hidden = false;
    byId('tellingTitle').focus({preventScroll: true});
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      const to = rightBubble.getBoundingClientRect();
      rightBubble.animate([
        {transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`},
        {transform: 'none'}
      ], {duration: 420, easing: 'ease-out'});
    }
    queen.scrollIntoView({block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth'});
  }

  function answer(isYes) {
    const isLast = questionIndex === bubbles.length - 1;
    if (isYes !== isLast) {
      feedback.textContent = 'Schau noch einmal im Lesetext nach.';
      return;
    }
    const answered = bubbles[questionIndex];
    feedback.textContent = `Richtig! Sie hat ${isLast ? 'gefragt' : 'nicht gefragt'}: „${answered.textContent}“`;
    answered.classList.remove('current');
    if (isLast) {
      tell();
      return;
    }
    answered.classList.add('reviewed');
    questionIndex++;
    const upcoming = bubbles[questionIndex];
    upcoming.hidden = false;
    upcoming.classList.add('current');
    byId('questionPrompt').textContent = 'Gehört die neue Frage zum Lesetext?';
  }

  function ready(failed) {
    if (completion.hidden) return;
    video.hidden = failed;
    fallback.hidden = !failed;
    fallback.textContent = 'Weiter';
    next.disabled = false;
    next.setAttribute('aria-label', 'Weiter zur nächsten Szene');
    next.onclick = async () => {
      const current = attempt;
      next.disabled = true;
      try {
        const response = await fetch('../szene-14/index.html', {method: 'HEAD', cache: 'no-store'});
        if (current !== attempt) return;
        if (response.ok) {
          location.assign('../szene-14/');
          return;
        }
      } catch {
        // Die Aufgabe kann auch ohne Verbindung wiederholt werden.
      }
      if (current !== attempt) return;
      next.disabled = false;
      transitionStatus.textContent = 'Hier geht die Geschichte bald weiter.';
      transitionStatus.hidden = false;
    };
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

  byId('done').onclick = () => {
    activity.hidden = true;
    completion.hidden = false;
    transitionStatus.hidden = true;
    byId('finishTitle').focus();
    if (!video.getAttribute('src')) video.src = 'assets/weiter-zu-szene-14.mp4';
    playTransition();
  };

  video.onended = () => ready(false);
  video.onerror = () => ready(true);
  byId('start').onclick = start;
  byId('retry').onclick = start;
  byId('yes').onclick = () => answer(true);
  byId('no').onclick = () => answer(false);
  byId('taskReading').replaceChildren(...Array.from(byId('readingText').children, p => p.cloneNode(true)));
  listen.onclick = () => speech.toggle(original);
  window.addEventListener('pagehide', () => speech.stop());
  updateSpeech();

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
})();
