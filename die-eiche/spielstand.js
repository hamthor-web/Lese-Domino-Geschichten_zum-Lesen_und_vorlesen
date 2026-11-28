window.EicheProgress = (() => {
  const sections = [1, 2, 3, 4];
  const prefix = 'die-eiche-checkpoint-v1-';
  const resetKey = 'die-eiche-reset-v1';
  const latestKey = 'die-eiche-last-section';
  const completionKey = section => 'die-eiche-completed-section-' + section;
  const version = localStorageValue(resetKey);

  function localStorageValue(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function read(section) {
    try { return JSON.parse(localStorageValue(prefix + section)); } catch { return null; }
  }
  function readForVisit(section) {
    const url = new URL(location.href);
    if (url.searchParams.get('neu') !== '1') return read(section);
    url.searchParams.delete('neu');
    history.replaceState(history.state, '', url);
    return null;
  }
  function save(section, state) {
    if (localStorageValue(resetKey) !== version) return;
    try {
      localStorage.setItem(prefix + section, JSON.stringify({...state, updated: Date.now()}));
      localStorage.setItem(latestKey, String(section));
    } catch {}
  }
  function latest() {
    const section = Number(localStorageValue(latestKey));
    if (sections.includes(section) && read(section)) return section;
    return sections.filter(n => read(n)).sort((a,b) => (read(b).updated ?? 0) - (read(a).updated ?? 0))[0] ?? null;
  }
  function complete(section) {
    if (localStorageValue(resetKey) !== version) return;
    try { localStorage.setItem(completionKey(section), 'yes'); } catch {}
  }
  function isComplete(section) {
    return localStorageValue(completionKey(section)) === 'yes';
  }
  function secondUnlocked() {
    return isComplete(1) || isComplete(2) || Boolean(read(2));
  }
  function thirdUnlocked() {
    return isComplete(2) || isComplete(3) || Boolean(read(3));
  }
  function reset() {
    localStorage.setItem(resetKey, String(Date.now()));
    for (const section of sections) {
      localStorage.removeItem(prefix + section);
      localStorage.removeItem(completionKey(section));
    }
    localStorage.removeItem(latestKey);
  }
  addEventListener('pageshow', event => {
    if (event.persisted && localStorageValue(resetKey) !== version) location.reload();
  });
  return {readForVisit, save, latest, complete, isComplete, secondUnlocked, thirdUnlocked, reset};
})();
