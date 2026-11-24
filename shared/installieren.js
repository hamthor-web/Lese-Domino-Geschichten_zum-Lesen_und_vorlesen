'use strict';

const install = document.querySelector('#installieren');
const help = document.querySelector('#installationshilfe');
const status = document.querySelector('#app-status');
const standalone = window.matchMedia('(display-mode: standalone)');
let promptEvent;
let installed = false;

function showInstallState() {
  const isInstalled = installed || standalone.matches || navigator.standalone === true;
  install.disabled = isInstalled;
  install.textContent = isInstalled ? 'Bereits installiert' : 'Installieren';
  if (isInstalled) {
    help.hidden = true;
    install.setAttribute('aria-expanded', 'false');
  }
}

showInstallState();
standalone.addEventListener('change', showInstallState);
window.addEventListener('pageshow', showInstallState);

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  promptEvent = event;
});

window.addEventListener('appinstalled', () => {
  installed = true;
  promptEvent = undefined;
  showInstallState();
  status.textContent = 'Die App wurde installiert.';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => {});
}

install.addEventListener('click', async () => {
  status.textContent = '';
  if (promptEvent) {
    const event = promptEvent;
    promptEvent = undefined;
    try {
      const {outcome} = await event.prompt();
      if (outcome === 'accepted') {
        installed = true;
        showInstallState();
        status.textContent = 'Die App wurde installiert.';
      }
      return;
    } catch {
      // Die Schritte über das Browsermenü bleiben verfügbar.
    }
  }
  help.hidden = !help.hidden;
  install.setAttribute('aria-expanded', String(!help.hidden));
});

const update = document.querySelector('#aktualisieren');
const updateStatus = document.querySelector('#update-status');
const versionPattern = /^[a-f0-9]{40}$/;
const currentVersion = document.querySelector('meta[name="app-version"]').content;
const pageUrl = new URL(location.href);
let availableVersion;
let checkController;

if (pageUrl.searchParams.has('aktualisiert')) {
  pageUrl.searchParams.delete('aktualisiert');
  history.replaceState(null, '', pageUrl);
}

function showUpdateState(label, message = '', version) {
  availableVersion = version;
  update.disabled = !version;
  update.textContent = label;
  if (updateStatus.textContent !== message) updateStatus.textContent = message;
}

function showUnavailable() {
  showUpdateState('Updateprüfung nicht möglich');
}

async function checkForUpdate() {
  if (checkController) return;
  if (!navigator.onLine || !versionPattern.test(currentVersion)) {
    showUnavailable();
    return;
  }

  const controller = new AbortController();
  checkController = controller;
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const endpoint = new URL('./app-version.json', pageUrl);
    endpoint.searchParams.set('prüfung', Date.now());
    const response = await fetch(endpoint, {cache: 'no-store', signal: controller.signal});
    if (!response.ok) throw new Error('Die Versionsdatei ist nicht erreichbar.');
    const {version} = await response.json();
    if (typeof version !== 'string' || !versionPattern.test(version)) throw new Error('Die Versionskennung fehlt.');
    if (controller !== checkController) return;
    if (version === currentVersion) {
      showUpdateState('Auf dem neuesten Stand');
    } else {
      showUpdateState('Aktualisieren', 'Eine neue Version ist verfügbar.', version);
    }
  } catch {
    if (controller === checkController) showUnavailable();
  } finally {
    clearTimeout(timeout);
    if (controller === checkController) checkController = undefined;
  }
}

update.addEventListener('click', () => {
  if (!availableVersion) return;
  const fresh = new URL(pageUrl);
  fresh.searchParams.set('aktualisiert', availableVersion);
  checkController?.abort();
  checkController = undefined;
  showUpdateState('Wird aktualisiert …');
  location.replace(fresh);
});

window.addEventListener('online', checkForUpdate);
window.addEventListener('offline', () => {
  checkController?.abort();
  checkController = undefined;
  showUnavailable();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) checkForUpdate();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
checkForUpdate();
