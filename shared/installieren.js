'use strict';

const install = document.querySelector('#installieren');
const update = document.querySelector('#aktualisieren');
const help = document.querySelector('#installationshilfe');
const status = document.querySelector('#app-status');
const standalone = window.matchMedia('(display-mode: standalone)');
let promptEvent;
let registration;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  promptEvent = event;
});

window.addEventListener('appinstalled', () => {
  promptEvent = undefined;
  help.hidden = true;
  install.setAttribute('aria-expanded', 'false');
  status.textContent = 'Silvana wurde installiert.';
});

if ('serviceWorker' in navigator) {
  registration = navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => undefined);
}

install.addEventListener('click', async () => {
  status.textContent = '';
  if (standalone.matches || navigator.standalone === true) {
    status.textContent = 'Silvana ist bereits als App geöffnet.';
    return;
  }
  if (promptEvent) {
    const event = promptEvent;
    promptEvent = undefined;
    try {
      await event.prompt();
      return;
    } catch {
      // Die Schritte über das Browsermenü bleiben verfügbar.
    }
  }
  help.hidden = !help.hidden;
  install.setAttribute('aria-expanded', String(!help.hidden));
});

update.addEventListener('click', async () => {
  update.disabled = true;
  status.textContent = 'Silvana wird aktualisiert …';
  try {
    const worker = await registration;
    if (worker) await worker.update().catch(() => undefined);
    const fresh = new URL('./', location.href);
    fresh.searchParams.set('aktualisiert', Date.now());
    const response = await fetch(fresh, {cache: 'no-store'});
    if (!response.ok) throw new Error('Die Startseite ist nicht erreichbar.');
    location.replace(fresh);
  } catch {
    status.textContent = 'Aktualisieren war gerade nicht möglich. Bitte prüfe deine Internetverbindung.';
    update.disabled = false;
  }
});

const pageUrl = new URL(location.href);
if (pageUrl.searchParams.has('aktualisiert')) {
  pageUrl.searchParams.delete('aktualisiert');
  history.replaceState(null, '', pageUrl);
  status.textContent = 'Silvana wurde neu geladen.';
}

document.querySelector('#zuruecksetzen').addEventListener('click', () => {
  if (!confirm('Möchtest du den gespeicherten Silvana-Spielfortschritt zurücksetzen?')) return;
  try {
    SilvanaProgress.reset();
    status.textContent = 'Der Spielfortschritt wurde zurückgesetzt.';
  } catch {
    status.textContent = 'Der Spielfortschritt konnte nicht zurückgesetzt werden.';
  }
});
