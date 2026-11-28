'use strict';

const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const live = process.env.SILVANA_BASE_URL;
const base = live || 'http://127.0.0.1:8768/';
const welcome = new URL('silvana/', base).href;
const server = live ? null : spawn('python3', ['-m', 'http.server', '8768', '--bind', '127.0.0.1'], {stdio: 'ignore'});
const scenes = [
  ['vorschau-einfuehrung', [0, 1, 2, 3]], ['szene-2', [1, 2, 3, 4]],
  ['szene-3', [0, 1, 3]], ['szene-4', [1, 2, 3]], ['szene-5', [0, 1, 3]],
  ['szene-6', [0, 1, 3]], ['szene-7', [1, 2, 3]], ['szene-8', [0, 1, 2, 3]],
  ['szene-9', ['reading', 'activity', 'finish']], ['szene-10', ['reading', 'activity', 'finish']],
  ['szene-11', ['reading', 'fall:0', 'puzzle:0', 'finish']], ['szene-12', ['reading', 'activity', 'finish']],
  ['szene-13', ['reading', 'activity', 'telling', 'finish']],
  ['szene-14', ['reading', 'activity', 'question', 'finish']]
];
const devices = [[320, 640], [412, 915], [844, 390], [768, 1024], [1024, 768], [1440, 900]];
const zooms = [[100, 100], [160, 100], [100, 160], [160, 160]];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function layout(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const layoutProblems = new Map();

async function checkActions(page, description) {
  const issues = await page.evaluate(() => {
    const problems = [];
    const groups = '#main, .topbar, .welcome, dialog, [data-parchment-group]';
    for (const group of document.querySelectorAll(groups)) {
      const controls = [...group.querySelectorAll('[data-parchment]')].filter(control =>
        control.getClientRects().length && control.closest(groups) === group
      );
      const bounds = controls.map(control => control.getBoundingClientRect());
      for (const [index, control] of controls.entries()) {
        const style = getComputedStyle(control);
        const glanz = getComputedStyle(control, '::before');
        const {width, height, left, right} = bounds[index];
        const label = control.textContent.trim();
        if (!style.borderImageSource.includes('button-pergament.webp') ||
            !glanz.backgroundImage.includes('button-glanz.webp')) {
          problems.push(['Gestaltung', label]);
        }
        if (Math.abs(width - bounds[0].width) >= 0.1 || Math.abs(height - bounds[0].height) >= 0.1) {
          problems.push(['Maße', label, width, height, controls[0].textContent.trim(), bounds[0].width, bounds[0].height]);
        }
        if (height < 55 || left < -1 || right > innerWidth + 1 ||
            control.scrollWidth > control.clientWidth + 1 || control.scrollHeight > control.clientHeight + 1) {
          problems.push(['Platz', label, width, height, left, right, control.scrollWidth, control.scrollHeight]);
        }
        const range = document.createRange();
        range.selectNodeContents(control);
        const sparkleEnd = left + parseFloat(glanz.left) + parseFloat(glanz.width);
        if ([...range.getClientRects()].some(rect => rect.width > 0 && rect.left < sparkleEnd - 1)) {
          problems.push(['Text über der Verzierung', label]);
        }
      }
      for (const control of group.querySelectorAll('button.primary, button.secondary, #main summary, .welcome .start')) {
        if (control.getClientRects().length && !control.hasAttribute('data-parchment') && !control.querySelector('video')) {
          problems.push(['Fehlende Gestaltung', control.textContent.trim()]);
        }
      }
    }
    return problems;
  });
  for (const issue of issues) {
    const key = [description.split(' ')[0], ...issue.slice(0, 2)].join(' ');
    if (!layoutProblems.has(key)) layoutProblems.set(key, [description, issue]);
  }
}


async function checkAppInfo(page, description) {
  const trigger = page.getByRole('button', {name: 'Informationen & Kontakt', exact: true});
  const dialog = page.getByRole('dialog', {name: 'Informationen & Kontakt'});
  const bounds = await trigger.boundingBox();
  const {width, height} = page.viewportSize();
  assert.ok(bounds && bounds.x > width / 2 && bounds.x + bounds.width <= width &&
    bounds.y < 32 && bounds.width >= 44, description + ' i-Button');
  const historyState = await page.evaluate(() => history.state);
  await trigger.tap();
  await dialog.waitFor();
  assert.equal(await dialog.getByText('Sprecherin: Nadine Weder', {exact: true}).count(), 1, description);
  assert.deepEqual(await dialog.getByRole('link').evaluateAll(links => links.map(a => [a.getAttribute('href'), a.target])), [
    ['https://lesespiele.heike-amthor.de/impressum', '_blank'],
    ['https://lesespiele.heike-amthor.de/datenschutz', '_blank'],
    ['https://lesespiele.heike-amthor.de/', '_blank'],
    ['mailto:lesespiele.heike.amthor@gmx.de', '']
  ], description);
  const box = await dialog.boundingBox();
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, description);
  assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), description);
  await dialog.getByRole('button', {name: 'Schließen'}).tap();
  await dialog.waitFor({state: 'hidden'});
  await page.waitForFunction(() => document.activeElement.id === 'appInfoButton');
  assert.deepEqual(await page.evaluate(() => history.state), historyState, description);
}

(async () => {
  let browser;
  try {
    for (let i = 0; i < 120; i++) {
      try {
        if ((await (await fetch(welcome + '?test=' + Date.now())).text()).includes('parchment-actions.js')) break;
      } catch {}
      if (i === 119) throw Error('Silvana-Begrüßung mit Pergament-Schaltflächen nicht erreichbar');
      await delay(500);
    }
    browser = await chromium.launch({channel: 'chrome'});
    const context = await browser.newContext({hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block'});
    await context.addInitScript(() => {
      const screen = new URL(location.href).searchParams.get('test-screen');
      if (screen !== null) {
        try {
          const value = /^\d+$/.test(screen) ? Number(screen) : screen;
          localStorage.setItem('silvana-completed-scenes-v1', JSON.stringify(Array.from({length: 14}, (_, i) => i + 1)));
          history.replaceState({silvana: {version: '', screen: value}}, '');
        } catch {}
      }
      Object.defineProperty(window, 'speechSynthesis', {value: {
        getVoices: () => [], cancel() {}, pause() {}, resume() {}, speak() {}
      }});
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(page.url() + ': ' + error.message));
    for (const [width, height] of devices) {
      await page.setViewportSize({width, height});
      await page.goto(welcome);
      await layout(page);
      await checkActions(page, 'Begrüßung ' + width + '×' + height);
      await checkAppInfo(page, 'Begrüßung ' + width + '×' + height);
      for (const [path, screens] of scenes) {
        for (const screen of screens) {
          await page.goto(base + path + '/?test-screen=' + screen, {waitUntil: 'domcontentloaded'});
          await page.waitForFunction(() => document.querySelector('#main [data-parchment]:not(summary)') &&
            (!document.getElementById('game') || document.getElementById('game').children.length));
          for (const [text, board] of zooms) {
            await page.evaluate(([text, board]) => {
              for (const [id, value] of [['textSize', text], ['boardSize', board]]) {
                const input = document.getElementById(id);
                input.value = value;
                input.dispatchEvent(new Event('input', {bubbles: true}));
              }
            }, [text, board]);
            await layout(page);
            const description = [path, screen, width, height, text, board].join(' ');
            await checkActions(page, description);
            if (screen === screens[0]) await checkAppInfo(page, description);
          }
        }
      }
    }
    assert.deepEqual([...layoutProblems.values()], []);
    await page.setViewportSize({width: 320, height: 640});
    await page.goto(base + 'szene-6/?test-screen=1');
    await page.locator('.zoom-open[data-parchment]').first().waitFor();
    await layout(page);
    const reread = await page.locator('#game summary').boundingBox();
    const back = await page.locator('#back').boundingBox();
    const next = await page.locator('#next').boundingBox();
    const magnifier = await page.locator('.zoom-open').first().boundingBox();
    assert.equal(reread.x, back.x);
    assert.equal(back.x, next.x);
    assert.ok(reread.y < back.y && back.y < next.y);
    assert.ok(next.width > magnifier.width && next.height < 100);
    await page.goto(base + 'szene-10/?test-screen=finish');
    for (const [width, height] of devices) {
      await page.setViewportSize({width, height});
      for (const [text, board] of zooms) {
        await page.evaluate(([text, board]) => {
          for (const [id, value] of [['textSize', text], ['boardSize', board]]) {
            const input = document.getElementById(id);
            input.value = value;
            input.dispatchEvent(new Event('input', {bubbles: true}));
          }
        }, [text, board]);
        const tops = await page.locator('.drop-target img').evaluateAll(images =>
          images.map(image => image.getBoundingClientRect().top));
        assert.equal(tops.length, 3);
        assert.ok(Math.max(...tops) - Math.min(...tops) < 1, 'Tropfenbilder stehen bündig');
      }
    }
    await page.setViewportSize({width: 320, height: 640});
    const stateTest = async (selector, label) => {
      const control = page.locator(selector);
      const before = await control.boundingBox();
      await control.click();
      await layout(page);
      assert.match(await control.innerText(), label);
      const after = await control.boundingBox();
      assert.equal(after.width, before.width);
      assert.equal(after.height, before.height);
    };
    await page.goto(base + 'szene-6/?test-screen=3');
    await layout(page);
    const speech = 'button[data-action-label*="Weiterhören"]';
    await stateTest(speech, /Pause/);
    await stateTest(speech, /Weiterhören/);
    await stateTest(speech, /Pause/);
    await page.goto(base + 'szene-9/?test-screen=activity');
    await layout(page);
    await stateTest('#showText', /Lesetext schließen/);
    await stateTest('#showText', /Zum Lesetext/);
    assert.deepEqual(errors, []);
    console.log('PASS: Pergament, gleiche Maße und erreichbare Texte in allen Szenen. Vorlesen und Lesetext behalten ihre Maße beim Wechsel.');
  } finally {
    await browser?.close();
    server?.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
