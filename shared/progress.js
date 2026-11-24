'use strict';

window.SilvanaProgress = (() => {
  const completedKey = 'silvana-completed-scenes-v1';
  const resetKey = 'silvana-progress-reset-v1';
  const legacyKey = 'silvana-visited-scenes-v1';
  const lastKey = 'silvana-last-screen-v1';
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
    localStorage.removeItem(lastKey);
    localStorage.setItem(resetKey, String(Date.now()));
    memory = [];
  }

  function read(state = history.state) {
    return state?.silvana?.version === version ? state.silvana.screen : undefined;
  }

  function scenePath() {
    return location.pathname.match(/\/(vorschau-einfuehrung|szene-(?:[2-9]|1[0-4]))\/(?:index\.html)?$/)?.[1];
  }

  function last() {
    try {
      const value = JSON.parse(localStorage.getItem(lastKey));
      return value?.version === resetVersion() && /^(vorschau-einfuehrung|szene-(?:[2-9]|1[0-4]))$/.test(value.path) ? value : null;
    } catch { return null; }
  }

  function resumeTarget() {
    const value = last();
    if (value) return '../' + value.path + '/?fortsetzen=1';
    const lastCompleted = Math.max(0, ...completed());
    if (lastCompleted > 1) return '../szene-' + lastCompleted + '/?abschnitt=abschluss';
    try {
      if (localStorage.getItem('silvana-intro-v1')) return '../vorschau-einfuehrung/?fortsetzen=1';
    } catch {}
    return null;
  }

  function remember(screen) {
    const path = scenePath();
    if (!path || resetVersion() !== version) return;
    try { localStorage.setItem(lastKey, JSON.stringify({version, path, screen})); } catch {}
  }

  function checkpoint(screen) {
    if (restoring || screen === activeScreen) return;
    remember(screen);
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
    const url = new URL(location.href);
    const fresh = url.searchParams.get('neu') === '1';
    const resume = url.searchParams.get('fortsetzen') === '1';
    const stored = resume ? last() : null;
    if (fresh || resume) {
      url.searchParams.delete('neu');
      url.searchParams.delete('fortsetzen');
      history.replaceState(null, '', url);
    }
    const requestedEnding = number && completed().includes(number)
      && new URLSearchParams(location.search).get('abschnitt') === 'abschluss';
    const saved = fresh ? undefined : (stored?.path === scenePath() ? stored.screen : read()) ?? (requestedEnding ? ending : undefined);
    checkpoint(saved ?? initial);
    if (saved === undefined || saved === initial) return false;
    show(saved);
    return true;
  }

  function show(screen) {
    if (!restoreScreen || screen === undefined) return;
    activeScreen = screen;
    remember(screen);
    restoring = true;
    try { restoreScreen(screen); } finally { restoring = false; }
  }

  addEventListener('popstate', event => show(read(event.state)));
  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (resetVersion() !== version) location.reload();
    else if (activeScreen !== undefined) remember(activeScreen);
  });

  return {completed, finish, reset, checkpoint, connect, previousScene, resumeTarget, isCurrent: () => resetVersion() === version};
})();
