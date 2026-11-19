'use strict';

(() => {
  const header = document.querySelector('.topbar, .welcome');
  const dialog = document.createElement('dialog');
  dialog.id = 'appInfo';
  dialog.setAttribute('aria-labelledby', 'appInfoTitle');
  dialog.innerHTML = `
    <h2 id="appInfoTitle" tabindex="-1" autofocus>Informationen &amp; Kontakt</h2>
    <p>Silvana · Das Land der glitzernden Spinnweben · Heike Amthor</p>
    <p>Sprecherin: Nadine Weder</p>
    <nav aria-label="Informationen zur App">
      <a href="https://lesespiele.heike-amthor.de/impressum" target="_blank" rel="noopener noreferrer">Impressum <span>(Website)</span></a>
      <a href="https://lesespiele.heike-amthor.de/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz <span>(Website)</span></a>
      <a href="https://lesespiele.heike-amthor.de/" target="_blank" rel="noopener noreferrer">Website der Entwicklerin</a>
      <a href="mailto:lesespiele.heike.amthor@gmx.de">Nachricht an die Entwicklerin</a>
    </nav>
    <p>lesespiele.heike.amthor@gmx.de</p>
    <p>Die Website-Links benötigen Internet und öffnen eine neue Seite. Für eine Nachricht öffnet sich deine E-Mail-App. Eine Nachricht wird erst verschickt, wenn du sie dort selbst sendest.</p>
    <form method="dialog"><button type="submit">Schließen</button></form>
  `;

  const button = document.createElement('button');
  button.id = 'appInfoButton';
  button.type = 'button';
  button.textContent = 'i';
  button.setAttribute('aria-label', 'Informationen & Kontakt');
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', dialog.id);
  button.addEventListener('click', () => {
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  dialog.addEventListener('close', () => button.focus({preventScroll: true}));

  header.classList.add('has-app-info');
  header.prepend(button);
  document.body.append(dialog);
})();
