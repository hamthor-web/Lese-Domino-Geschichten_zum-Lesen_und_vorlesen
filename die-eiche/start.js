(() => {
  const resume = document.getElementById('eiche-resume');

  function updateStart() {
    const section = EicheProgress.latest();
    resume.disabled = section === null;
    resume.onclick = () => { if (section !== null) location.assign('./abschnitt-' + section + '/'); };
  }

  updateStart();
  addEventListener('pageshow', updateStart);
  addEventListener('storage', updateStart);
  addEventListener('game-reset', updateStart);
})();
