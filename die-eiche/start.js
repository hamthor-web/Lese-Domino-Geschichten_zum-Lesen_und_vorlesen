(() => {
  const resume = document.getElementById('eiche-resume');
  const restart = document.getElementById('eiche-restart');
  const second = document.getElementById('eiche-second');

  function updateStart() {
    const section = EicheProgress.latest();
    resume.hidden = section === null;
    resume.href = './abschnitt-' + (section ?? 1) + '/';
    const canReplay = section !== null || EicheProgress.secondUnlocked();
    restart.textContent = canReplay ? 'Spiel neu starten' : 'Spiel beginnen';
    second.hidden = !EicheProgress.secondUnlocked();
  }

  updateStart();
  addEventListener('pageshow', updateStart);
  addEventListener('storage', updateStart);
  addEventListener('game-reset', updateStart);
})();
