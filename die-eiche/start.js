(() => {
  const start = document.getElementById('eiche-start');
  function updateStart() {
    const section = EicheProgress.latest();
    start.href = './abschnitt-' + (section ?? 1) + '/';
    start.textContent = section ? 'Spiel fortsetzen' : 'Lass uns das Spiel mit der Geschichte beginnen!';
  }
  updateStart();
  addEventListener('pageshow', updateStart);
  addEventListener('storage', updateStart);
  addEventListener('game-reset', updateStart);
})();
