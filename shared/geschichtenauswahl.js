'use strict';

(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('lesegeschichten-begruesst')) return;
    sessionStorage.setItem('lesegeschichten-begruesst', 'yes');
  } catch {}
  const clip = document.getElementById('begrüßung');
  const choices = document.getElementById('geschichten');
  const deadline = setTimeout(finish, 6500);
  function finish() {
    clearTimeout(deadline);
    clip.pause();
    clip.hidden = true;
    choices.hidden = false;
  }
  clip.addEventListener('playing', () => {
    if (!clip.hidden && !choices.contains(document.activeElement)) choices.hidden = true;
  }, {once: true});
  clip.addEventListener('ended', finish, {once: true});
  clip.addEventListener('error', finish, {once: true});
  clip.hidden = false;
  clip.play().catch(finish);
})();
