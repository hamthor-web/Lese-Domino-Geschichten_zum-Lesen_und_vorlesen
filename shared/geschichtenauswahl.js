'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const parentButton = document.getElementById('eltern-button');
  const parentInfo = document.getElementById('eltern-informationen');
  parentButton.addEventListener('click', () => {
    const open = parentInfo.hidden;
    parentInfo.hidden = !open;
    parentButton.setAttribute('aria-expanded', String(open));
    if (open) {
      parentInfo.querySelector('h2').focus({preventScroll: true});
      parentInfo.scrollIntoView({block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    }
  });

  if (reducedMotion.matches) return;
  try {
    if (sessionStorage.getItem('lesegeschichten-begruesst')) return;
    sessionStorage.setItem('lesegeschichten-begruesst', 'yes');
  } catch {}
  const clip = document.getElementById('begrüßung');
  const still = document.getElementById('lesebild');
  const choices = document.getElementById('geschichten');
  const deadline = setTimeout(finish, 6500);
  function finish() {
    clearTimeout(deadline);
    clip.pause();
    clip.hidden = true;
    still.hidden = false;
    choices.hidden = false;
  }
  clip.addEventListener('playing', () => {
    if (!clip.hidden && !choices.contains(document.activeElement)) choices.hidden = true;
  }, {once: true});
  clip.addEventListener('ended', finish, {once: true});
  clip.addEventListener('error', finish, {once: true});
  still.hidden = true;
  clip.hidden = false;
  clip.play().catch(finish);
})();
