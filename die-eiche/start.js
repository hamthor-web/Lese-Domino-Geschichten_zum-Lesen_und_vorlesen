(() => {
  const resume = document.getElementById('eiche-resume');
  const second = document.getElementById('eiche-second');

  function updateStart() {
    const section = EicheProgress.latest();
    resume.disabled = section === null;
    resume.onclick = () => { if (section !== null) location.assign('./abschnitt-' + section + '/'); };
    second.hidden = !EicheProgress.secondUnlocked();
  }

  updateStart();
  addEventListener('pageshow', updateStart);
  addEventListener('storage', updateStart);
  addEventListener('game-reset', updateStart);
})();
