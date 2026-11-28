const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { resolve, extname } = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.css': 'text/css', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml', '.json': 'application/json'
};

function localServer() {
  const root = resolve(__dirname, '..');
  return createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const filename = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    try {
      if (!filename.startsWith(root + '/')) throw new Error('Invalid path');
      const data = await readFile(filename);
      response.writeHead(200, {'Content-Type': types[extname(filename)] || 'application/octet-stream'});
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
}


(async () => {
  const server = localServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({channel: 'chrome'});
  const base = `http://127.0.0.1:${server.address().port}/`;
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  const button = id => page.locator('#' + id);
  const selection = page.getByRole('navigation', {name: 'Geschichte auswählen'});
  const silvana = new URL('silvana/', base).href;
  const startLabel = 'Spiel beginnen';
  const intro = url => url.pathname === '/vorschau-einfuehrung/' && url.searchParams.get('neu') === '1';
  await page.goto(base);
  assert.equal(await page.locator('h1').textContent(), 'Geschichten zum Lesen und Vorlesen');
  assert(await selection.getByRole('link', {name: 'Die Eiche', exact: true}).isVisible());
  await selection.getByRole('link', {name: 'Silvana', exact: true}).click();
  await page.waitForURL(silvana);
  for (const [width, height] of [[320, 640], [844, 390], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({width, height});
    assert.equal(await page.locator('h1').textContent(), 'Silvana');
    await page.waitForFunction(() => document.querySelector('.mascot img').naturalWidth > 0);
    assert(await page.getByRole('link', {name: startLabel, exact: true}).isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.getByRole('link', {name: startLabel, exact: true}).click();
  await page.waitForURL(intro);

  const phone = await browser.newPage({
    hasTouch: true, isMobile: true, viewport: {width: 393, height: 780}, serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  });
  await phone.addInitScript(() => {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
    });
  });
  const oldVersion = 'a'.repeat(40);
  const newVersion = 'b'.repeat(40);
  await phone.route(base + 'app-version.json?*', route => route.fulfill({json: {version: newVersion}}));
  await phone.route(url => url.pathname === '/', async route => {
    const response = await route.fetch();
    const version = new URL(route.request().url()).searchParams.has('aktualisiert') ? newVersion : oldVersion;
    const body = (await response.text()).replace('{{ site.github.build_revision }}', version);
    await route.fulfill({response, body});
  });
  await phone.goto(base);
  await phone.getByText('Zum Home-Bildschirm hinzufügen', {exact: true}).tap();
  assert(await phone.getByText(/Tippe in Safari auf/).isVisible());
  await phone.getByText('Zum Home-Bildschirm hinzufügen', {exact: true}).tap();
  assert.equal(await phone.getByText(/Tippe in Safari auf/).isVisible(), false);
  const parentInfo = phone.getByRole('button', {name: 'Warum ist hier ein Würstchen?'});
  await parentInfo.tap();
  assert(await phone.getByRole('heading', {name: 'Für die Eltern und Lesebegleiter'}).isVisible());
  assert(await phone.locator('footer p.note').evaluate(note =>
    note.getBoundingClientRect().top >= document.querySelector('main').getBoundingClientRect().bottom));
  await parentInfo.tap();
  const reload = phone.waitForRequest(request => request.isNavigationRequest() &&
    new URL(request.url()).searchParams.get('aktualisiert') === newVersion);
  await phone.getByRole('button', {name: 'Aktualisieren'}).tap();
  await reload;
  await phone.waitForFunction(() =>
    document.querySelector('meta[name="app-version"]').content === 'b'.repeat(40) &&
    !new URL(location.href).searchParams.has('aktualisiert'));
  assert.equal(await phone.getByRole('button', {name: 'Aktualisieren'}).isVisible(), false);
  await phone.getByRole('navigation', {name: 'Geschichte auswählen'})
    .getByRole('link', {name: 'Silvana', exact: true}).tap();
  await phone.waitForURL(silvana);
  await phone.getByRole('link', {name: startLabel, exact: true}).tap();
  await phone.waitForURL(intro);
  await phone.close();
  const chapterStarts = [
    'Hinter den dunklen Bergen', 'Vier Straßen voller Schlaglöcher', 'In den Wäldern', 'Vor langer Zeit',
    'Eines Tages', '„Ich bezahle in Gold“', 'Am nächsten Morgen', 'Der König schnaubte', 'Am Rand des Weges',
    '„Dann zeig mir', 'Hinter ihnen verlagerte ein Pferd', 'Auf der Rückreise', 'Die Königin', 'Dann sah er'
  ];
  const chapters = await browser.newContext({viewport: {width: 390, height: 844}});
  await chapters.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {getVoices: () => [], speak: utterance => { window.currentSpeech = utterance; }, cancel() {}}
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class { constructor(text) { this.text = text; } }
    });
  });
  const chapter = await chapters.newPage();
  chapter.on('pageerror', err => errors.push(err.message));
  for (const [index, text] of chapterStarts.entries()) {
    const number = index + 1;
    const path = number === 1 ? 'vorschau-einfuehrung/' : 'szene-' + number + '/';
    await chapter.goto(base + path);
    assert.equal(await chapter.locator('.story-end:visible').count(), 0);
    await chapter.evaluate(number => localStorage.setItem('silvana-completed-scenes-v1', JSON.stringify([number])), number);
    await chapter.goto(base + path + '?abschnitt=abschluss');
    const story = chapter.locator('.story-end').first();
    const listen = story.getByRole('button');
    await listen.waitFor();
    assert((await story.locator('.original').textContent()).startsWith(text), path + ' Vorlesetext');
    const size = () => listen.evaluate(button => [button.offsetWidth, button.offsetHeight]);
    const initialSize = await size();
    if (number === 14) {
      const fullSize = await chapter.locator('#listenFull').evaluate(button => [button.offsetWidth, button.offsetHeight]);
      assert.deepEqual(fullSize, initialSize);
    }
    await listen.click();
    assert.equal(await listen.textContent(), 'Pause');
    assert(await chapter.evaluate(() => !!window.currentSpeech.text));
    assert.deepEqual(await size(), initialSize);
    await listen.click();
    assert.equal(await listen.textContent(), 'Weiterhören');
    assert.deepEqual(await size(), initialSize);
    await listen.click();
    assert.equal(await listen.textContent(), 'Pause');
    assert.deepEqual(await size(), initialSize);
  }
  await chapters.close();

  const questionCount = () => page.locator('#questions .speech-bubble:visible').count();
  async function checkWidth(stage, width, height, font, board) {
    const result = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      overflowing: Array.from(document.querySelectorAll('main *'))
        .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
        .map(el => el.id || el.className || el.tagName).slice(0, 10)
    }));
    assert(result.document <= result.viewport,
      `${stage} ${width}x${height} bei ${font}/${board} %: ${JSON.stringify(result)}`);
  }
  for (const [width,height] of [[320,640],[390,844],[844,390],[768,1024],[1024,768],[1440,900]]) {
    await page.setViewportSize({width,height});
    for (const [font,board] of [[100,100],[160,80],[90,160],[160,160]]) {
      await page.goto(base + 'szene-13/?test=' + [width, height, font, board].join('-'));
      await button('settingsToggle').click();
      for (const [key,value] of [['textSize',font],['boardSize',board]]) {
        await button(key).evaluate((input,value) => {
          input.value = value;
          input.dispatchEvent(new Event('input'));
        },value);
      }
      await checkWidth('Lesetext', width, height, font, board);
      assert(await page.locator('#reading img').evaluate(img => img.complete && img.naturalWidth > 0));
      assert.equal(await button('listen').isVisible(), false);
      await button('start').click();
      assert.equal(await questionCount(),1);
      await button('yes').click();
      assert.equal(await questionCount(),1);
      await button('no').click();
      assert.equal(await questionCount(),2);
      assert.equal(await button('feedback').textContent(), 'Richtig! Sie hat nicht gefragt: „Wo bist du gewesen?“');
      await button('no').click();
      assert.equal(await questionCount(),3);
      await button('no').click();
      assert.equal(await questionCount(),3);
      await checkWidth('Aufgabe', width, height, font, board);
      await button('yes').click();
      assert.equal(await questionCount(),2);
      assert.equal(await button('feedback').textContent(), 'Richtig! Sie hat gefragt: „Was hast du mitgebracht?“');
      const queenBubble = page.locator('#queenPicture .speech-bubble');
      assert(await queenBubble.isVisible());
      assert(await queenBubble.evaluate(async bubble => {
        await Promise.all(bubble.getAnimations().map(animation => animation.finished));
        const image = bubble.previousElementSibling.getBoundingClientRect();
        const box = bubble.getBoundingClientRect();
        return box.top >= image.top && box.right <= image.right && box.bottom <= image.bottom;
      }));
      assert(await page.getByText('Was hat der König auf die Fragen geantwortet?', {exact: true}).isVisible());
      assert(await button('done').isVisible());
      assert.equal(await button('listen').isVisible(), false);
      assert.equal(await button('transitionVideo').getAttribute('src'),null);
      await checkWidth('Erzählen', width, height, font, board);
    }
  }
  await button('done').click();
  assert(await button('listen').isVisible());
  const nextBounds = await button('nextScene').boundingBox();
  const videoBounds = await button('transitionVideo').boundingBox();
  assert.equal(nextBounds.width, videoBounds.width);
  assert.equal(await button('nextScene').evaluate(element => getComputedStyle(element).opacity), '1');
  assert(nextBounds.width >= 250);
  await page.waitForFunction(() => !document.getElementById('nextScene').disabled);
  assert(await button('transitionVideo').evaluate(v => v.ended && v.currentTime > 0));
  await button('retry').click();
  assert.equal(await questionCount(),1);
  await button('no').click();
  await button('no').click();
  await button('yes').click();
  await button('done').click();
  await button('nextScene').click();
  await page.waitForURL('**/szene-14/');
  assert.equal(await button('sceneMenu14').count(), 0);
  await page.goBack();
  await button('completion').waitFor({state: 'visible'});
  await page.goForward();
  await button('start').waitFor({state: 'visible'});
  for (const [width, height] of [[320, 640], [390, 844], [844, 390], [768, 1024], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({width, height});
    for (const [font, board] of [[100, 100], [160, 80], [90, 160], [160, 160]]) {
      await page.goto(base + 'szene-14/?test=' + [width, height, font, board].join('-'));
      await button('settingsToggle').click();
      for (const [key, value] of [['textSize', font], ['boardSize', board]]) {
        await button(key).evaluate((input, value) => {
          input.value = value;
          input.dispatchEvent(new Event('input'));
        }, value);
      }
      await checkWidth('Szene 14 Lesetext', width, height, font, board);
      await button('start').click();
      await checkWidth('Szene 14 Puzzle', width, height, font, board);
    }
  }
  const piece = number => page.getByRole('button', {name: 'Puzzleteil ' + number, exact: true});
  const target = number => page.locator('.target').nth(number - 1);
  assert.equal(await page.locator('.piece:visible').count(), 6);
  await piece(1).click();
  await target(2).click();
  assert.match(await button('feedback').innerText(), /anderen Platz/);
  await target(1).click();
  assert.match(await button('feedback').innerText(), /Drehe/);
  for (let number = 1; number <= 6; number++) {
    const loose = piece(number);
    await loose.click();
    const angle = await loose.evaluate(el => parseInt(el.style.getPropertyValue('--turn'), 10));
    for (let turn = angle; turn % 360; turn += 90) await button('rotate').click();
    if (number === 1) {
      await loose.dragTo(target(2));
      assert.match(await button('feedback').innerText(), /anderen Platz/);
      await loose.dragTo(target(number));
    } else {
      await target(number).click();
    }
    assert.equal(await loose.isVisible(), false);
  }
  assert(await button('assembled').isVisible());
  assert(await button('questionTitle').isVisible());
  assert.equal(await page.locator('#answers button').last().textContent(), 'Man muss genau hinschauen.');
  await page.getByRole('button', {name: 'Gold ist wichtiger.'}).click();
  assert(!(await button('board').evaluate(el => el.classList.contains('revealed'))));
  assert(await button('glowVideo').evaluate(video => video.paused && video.currentTime === 0));
  await page.getByRole('button', {name: 'Man muss genau hinschauen.'}).click();
  assert(await button('ending').isVisible());
  assert.equal(await button('questionTitle').isVisible(), false);
  assert.equal(await button('sceneFooter').isVisible(), false);
  assert.equal(await page.locator('#endingTitle + .credit').textContent(),
    'Dieser Gedanke stammt ursprünglich aus dem Buch „Der kleine Prinz“.');
  assert(await button('glow').evaluate(image => image.complete && image.naturalWidth === 1254));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#glowVideo')).opacity === '1');
  await checkWidth('Szene 14 Abschluss', 1440, 900, 160, 160);
  await page.waitForFunction(() => document.querySelector('#glowVideo').ended);
  assert(await button('glowVideo').evaluate(video => video.classList.contains('is-playing') && video.currentTime >= 4.9));
  const sparkle = page.getByRole('button', {name: 'Abschlussbild erneut funkeln lassen'});
  assert.equal(await sparkle.textContent(), '');
  await sparkle.click();
  await page.waitForFunction(() => {
    const video = document.querySelector('#glowVideo');
    return !video.paused && video.currentTime < 2;
  });
  await page.locator('#readFull summary').click();
  assert((await button('fullStory').innerText()).length > 1000);
  assert.equal(await page.locator('#readFull').evaluate(el => el.open), true);
  await page.goBack();
  await button('questionTitle').waitFor({state: 'visible'});
  await page.goForward();
  await button('ending').waitFor({state: 'visible'});
  await button('retry').click();
  assert(await button('glowVideo').evaluate(video => video.paused && video.currentTime === 0 && !video.classList.contains('is-playing')));
  assert.equal(await page.locator('.piece:visible').count(), 6);
  assert.equal(await button('question').isVisible(), false);
  const scenePaths = ['vorschau-einfuehrung/', ...Array.from({length: 13}, (_, i) => 'szene-' + (i + 2) + '/')];
  for (const path of scenePaths) {
    await page.goto(base + path);
    assert.equal(await button('sceneMenu13').textContent(),'Zu Hause');
    assert.equal(await button('sceneMenu14').textContent(),'2. Erkenntnis');
    assert.equal(await page.locator('.scene-menu nav a').count(), 2);
  }
  await page.goto(silvana);
  page.once('dialog', dialog => dialog.accept());
  await button('zuruecksetzen').click();
  await page.getByText('Der Spielfortschritt wurde zurückgesetzt.').waitFor();
  await page.goto(base + 'szene-13/');
  assert.equal(await page.locator('.scene-menu nav a').count(), 0);
  assert.deepEqual(errors,[]);
  await browser.close();
  server.close();
  console.log('Szenen 13 und 14: je 24 Geräte-/Zoomkombinationen, Übergang, Puzzle, Schlussfrage und Szenenmenü geprüft.');
})().catch(error => { console.error(error); process.exit(1); });
