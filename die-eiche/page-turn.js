/* Shared transition; replace the screen at the fold, not before the turn. */
window.EichePageTurn = (() => {
  const sound = new Audio('../../assets/die-eiche/abschnitt-1/blaettern.mp3');
  sound.preload = 'auto';
  sound.volume = .22;
  let turning = false;
  function run(change, backward = false) {
    if (turning) return false;
    sound.currentTime = 0;
    sound.play().catch(() => {});
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      change();
      return true;
    }
    turning = true;
    const layer = document.createElement('div');
    layer.className = 'turn-layer' + (backward ? ' reverse' : '');
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div class="turn-sheet"></div>';
    document.body.append(layer);
    setTimeout(change, 300);
    setTimeout(() => { layer.remove(); turning = false; }, 740);
    return true;
  }
  return {run, get busy() { return turning; }};
})();
