'use strict';

function createStorySpeech(onChange) {
  const engine = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  const available = Boolean(engine && Utterance);
  let state = 'idle';
  let sentences = [];
  let sentenceIndex = 0;
  let wordOffset = 0;
  let active = null;

  function changeState(next) {
    state = next;
    if (state === 'playing') document.addEventListener('visibilitychange', pauseWhenHidden);
    else document.removeEventListener('visibilitychange', pauseWhenHidden);
    onChange();
  }

  function cancel() {
    if (!active) return;
    active = null;
    engine.cancel();
  }

  function stop() {
    cancel();
    sentences = [];
    sentenceIndex = 0;
    wordOffset = 0;
    changeState('idle');
  }

  function readSentence() {
    // Ein neuer Auftrag funktioniert auch dann, wenn resume() wirkungslos bleibt.
    const startOffset = wordOffset;
    const utterance = new Utterance(sentences[sentenceIndex].slice(startOffset));
    utterance.lang = 'de-DE';
    utterance.rate = .85;
    const voice = engine.getVoices().find(voice => /^de(?:[-_]|$)/i.test(voice.lang));
    if (voice) utterance.voice = voice;
    active = utterance;

    utterance.onboundary = event => {
      if (active !== utterance || event.name !== 'word') return;
      const offset = startOffset + event.charIndex;
      if (offset > wordOffset && offset < sentences[sentenceIndex].length) wordOffset = offset;
    };
    utterance.onend = () => {
      if (active !== utterance) return;
      active = null;
      wordOffset = 0;
      sentenceIndex++;
      if (sentenceIndex < sentences.length) readSentence();
      else changeState('ended');
    };

    const fail = () => {
      if (active !== utterance) return;
      active = null;
      changeState('error');
    };
    utterance.onerror = fail;
    try {
      engine.speak(utterance);
    } catch {
      fail();
    }
  }

  function start(text) {
    if (!available) return;
    cancel();
    const parts = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('de', {granularity: 'sentence'}).segment(text), part => part.segment)
      : text.split(/(?<=[.!?…»“”])\s+|\n+/u);
    sentences = parts.map(part => part.trim()).filter(Boolean);
    sentenceIndex = 0;
    wordOffset = 0;
    if (!sentences.length) {
      changeState('error');
      return;
    }
    changeState('playing');
    readSentence();
  }

  function pause() {
    cancel();
    changeState('paused');
  }

  function toggle(text) {
    if (!available) return;
    if (state === 'playing') pause();
    else if (state === 'paused') {
      changeState('playing');
      readSentence();
    } else start(text);
  }

  function pauseWhenHidden() {
    if (document.hidden && state === 'playing') pause();
  }

  return {available, get state() { return state; }, start, stop, toggle};
}

function mountStoryReading(container, text, {id = 'audioToggle', title = 'Vorlesegeschichte', label = 'Geschichte vorlesen', statusId = 'audioStatus', readingId, textId, readingLabel = 'Geschichte mitlesen', beforeToggle} = {}) {
  const section = document.createElement('section');
  section.className = 'story-end';
  const heading = document.createElement('h2');
  heading.textContent = title;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary';
  button.id = id;
  const status = document.createElement('p');
  status.id = statusId;
  status.setAttribute('role', 'status');
  const details = document.createElement('details');
  details.className = 'story-reading';
  if (readingId) details.id = readingId;
  const summary = document.createElement('summary');
  summary.textContent = readingLabel;
  const original = document.createElement('div');
  original.className = 'original';
  if (textId) original.id = textId;
  original.textContent = text;
  details.append(summary, original);
  section.append(heading, button, status, details);
  const actions = Array.from(container.children).find(el => el.matches('.actions, .controls, .scene-transition, .adventure-link'));
  container.insertBefore(section, actions || null);

  const labels = {
    playing: 'Pause',
    paused: 'Weiterhören',
    ended: 'Noch einmal hören',
    error: 'Erneut vorlesen'
  };
  button.dataset.actionLabel = [label, ...Object.values(labels)].join('|');
  const speech = createStorySpeech(update);
  function update() {
    button.textContent = labels[speech.state] || label;
    button.disabled = !speech.available;
    status.textContent = !speech.available ? 'Die Vorlesestimme ist hier nicht verfügbar.'
      : speech.state === 'error' ? 'Die Vorlesestimme konnte nicht starten.' : '';
    status.hidden = !status.textContent;
  }
  button.onclick = () => {
    beforeToggle?.();
    speech.toggle(text);
  };
  update();
  return speech;
}
