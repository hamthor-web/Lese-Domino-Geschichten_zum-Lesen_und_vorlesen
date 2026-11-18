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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') pause();
  });

  return {available, get state() { return state; }, start, stop, toggle};
}
