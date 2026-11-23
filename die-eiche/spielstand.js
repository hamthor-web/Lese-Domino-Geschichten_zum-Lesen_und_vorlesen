window.EicheProgress = (() => {
  const prefix = 'die-eiche-checkpoint-v1-';
  const resetKey = 'die-eiche-reset-v1';
  const version = localStorageValue(resetKey);
  function localStorageValue(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function read(section) {
    try { return JSON.parse(localStorageValue(prefix + section)); } catch { return null; }
  }
  function save(section, state) {
    if (localStorageValue(resetKey) !== version) return;
    try { localStorage.setItem(prefix + section, JSON.stringify({...state, updated: Date.now()})); } catch {}
  }
  function latest() {
    const first = read(1);
    const second = read(2);
    if (!first && !second) return null;
    return (second?.updated ?? 0) >= (first?.updated ?? 0) && second ? 2 : 1;
  }
  function reset() {
    for (const section of [1, 2]) {
      localStorage.removeItem(prefix + section);
      localStorage.removeItem('die-eiche-completed-section-' + section);
    }
    localStorage.setItem(resetKey, String(Date.now()));
  }
  addEventListener('pageshow', event => {
    if (event.persisted && localStorageValue(resetKey) !== version) location.reload();
  });
  return {read, save, latest, reset};
})();
