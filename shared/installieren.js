'use strict';

const install = document.querySelector('#installieren');
const help = document.querySelector('#installationshilfe');
const standalone = window.matchMedia('(display-mode: standalone)');
const userAgent = navigator.userAgent;
const appleMobile = /iPad|iPhone|iPod/.test(userAgent)
  || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
const mobileSafari = appleMobile && /Version\/[\d.]+.*Safari\//.test(userAgent)
  && !/(?:CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA)\//.test(userAgent);
let promptEvent;
let installed = false;

function showInstallActions() {
  const inApp = installed || standalone.matches || navigator.standalone === true;
  install.hidden = inApp || !promptEvent;
  help.hidden = inApp || !!promptEvent || !mobileSafari;
}

showInstallActions();
standalone.addEventListener('change', showInstallActions);
window.addEventListener('pageshow', showInstallActions);

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  promptEvent = event;
  showInstallActions();
});

window.addEventListener('appinstalled', () => {
  installed = true;
  promptEvent = undefined;
  showInstallActions();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => {});
}

install.addEventListener('click', async () => {
  if (!promptEvent) return;
  const event = promptEvent;
  promptEvent = undefined;
  install.disabled = true;
  try {
    const {outcome} = await event.prompt();
    if (outcome === 'accepted') installed = true;
  } catch {
    // A later browser prompt can offer installation again.
  } finally {
    install.disabled = false;
    showInstallActions();
  }
});

const update = document.querySelector('#aktualisieren');
const versionPattern = /^[a-f0-9]{40}$/;
const currentVersion = document.querySelector('meta[name="app-version"]').content;
const pageUrl = new URL(location.href);
let availableVersion;
let checkController;

if (pageUrl.searchParams.has('aktualisiert')) {
  pageUrl.searchParams.delete('aktualisiert');
  history.replaceState(null, '', pageUrl);
}

function showAvailableUpdate(version) {
  availableVersion = version;
  update.hidden = !version;
}

async function checkForUpdate() {
  if (checkController) return;
  if (!navigator.onLine || !versionPattern.test(currentVersion)) {
    showAvailableUpdate();
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
    showAvailableUpdate(version === currentVersion ? undefined : version);
  } catch {
    if (controller === checkController) showAvailableUpdate();
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
  showAvailableUpdate();
  location.replace(fresh);
});

window.addEventListener('online', checkForUpdate);
window.addEventListener('offline', () => {
  checkController?.abort();
  checkController = undefined;
  showAvailableUpdate();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) checkForUpdate();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
checkForUpdate();
