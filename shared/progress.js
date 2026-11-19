'use strict';

window.SilvanaProgress = (() => {
  const completedKey = 'silvana-completed-scenes-v1';
  const resetKey = 'silvana-progress-reset-v1';
  const legacyKey = 'silvana-visited-scenes-v1';
  let memory = [];
  let restoreScreen;
  let activeScreen;
  let restoring = false;

  function resetVersion() {
    try { return localStorage.getItem(resetKey) || ''; } catch { return ''; }
  }

  const version = resetVersion();

  function completed() {
    try {
      const value = JSON.parse(localStorage.getItem(completedKey));
      return Array.isArray(value) ? value.filter(n => Number.isInteger(n) && n >= 1 && n <= 14) : memory;
    } catch { return memory; }
  }

  function finish(number) {
    if (restoring || resetVersion() !== version) return;
    memory = [...new Set([...completed(), number])].sort((a, b) => a - b);
    try { localStorage.setItem(completedKey, JSON.stringify(memory)); } catch {}
    dispatchEvent(new Event('silvana-progress'));
  }

  function reset() {
    localStorage.removeItem(completedKey);
    localStorage.removeItem(legacyKey);
    localStorage.removeItem('silvana-intro-v1');
    localStorage.setItem(resetKey, String(Date.now()));
    memory = [];
  }

  function read(state = history.state) {
    return state?.silvana?.version === version ? state.silvana.screen : undefined;
  }

  function checkpoint(screen) {
    if (restoring || screen === activeScreen) return;
    const data = {...history.state, silvana: {version, screen}};
    if (activeScreen === undefined) history.replaceState(data, '');
    else history.pushState(data, '');
    activeScreen = screen;
  }

  function previousScene(number) {
    const path = number === 1 ? 'vorschau-einfuehrung' : 'szene-' + number;
    const ending = completed().includes(number) ? '?abschnitt=abschluss' : '';
    return '../' + path + '/' + ending;
  }

  function connect(initial, restore, number, ending = 'finish') {
    restoreScreen = restore;
    const requestedEnding = number && completed().includes(number)
      && new URLSearchParams(location.search).get('abschnitt') === 'abschluss';
    const saved = read() ?? (requestedEnding ? ending : undefined);
    checkpoint(saved ?? initial);
    if (saved === undefined || saved === initial) return false;
    show(saved);
    return true;
  }

  function show(screen) {
    if (!restoreScreen || screen === undefined) return;
    activeScreen = screen;
    restoring = true;
    try { restoreScreen(screen); } finally { restoring = false; }
  }

  addEventListener('popstate', event => show(read(event.state)));
  addEventListener('pageshow', event => {
    if (event.persisted && resetVersion() !== version) location.reload();
  });

  return {completed, finish, reset, checkpoint, connect, previousScene};
})();
