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
  const startLabel = 'Lass uns das Spiel mit der Geschichte beginnen!';
  for (const [width, height] of [[320, 640], [844, 390], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({width, height});
    await page.goto(base);
    assert.equal(await page.locator('h1').textContent(), 'Silvana');
    await page.waitForFunction(() => document.querySelector('.mascot img').naturalWidth > 0);
    assert(await page.getByRole('link', {name: startLabel}).isVisible());
    assert(await page.locator('footer p.note').evaluate(note =>
      note.getBoundingClientRect().top >= document.querySelector('main').getBoundingClientRect().bottom));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.getByRole('link', {name: startLabel}).click();
  await page.waitForURL('**/vorschau-einfuehrung/');
  const phone = await browser.newPage({hasTouch: true, isMobile: true, viewport: {width: 393, height: 780}});
  await phone.addInitScript(() => {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
    });
  });
  await phone.goto(base);
  await phone.getByRole('button', {name: 'Installieren'}).tap();
  assert(await phone.getByText('iPhone und iPad:', {exact: true}).isVisible());
  await phone.getByRole('button', {name: 'Installieren'}).tap();
  assert.equal(await phone.locator('#installationshilfe').isVisible(), false);
  await phone.getByRole('button', {name: 'Aktualisieren'}).tap();
  await phone.getByText('Silvana wurde neu geladen.', {exact: true}).waitFor();
  await phone.getByRole('link', {name: startLabel}).tap();
  await phone.waitForURL('**/vorschau-einfuehrung/');
  await phone.close();
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
      await page.goto(base + 'szene-13/');
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
  const widths = await page.locator('#completion .home-actions button')
    .evaluateAll(items => items.map(button => button.offsetWidth));
  assert.equal(widths[0], widths[1]);
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
      await page.goto(base + 'szene-14/');
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
  assert.equal(await page.locator('#endingTitle + p:last-child').textContent(),
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
  await page.getByText('Geschichte mitlesen', {exact: true}).click();
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
  await page.goto(base);
  assert(await page.getByRole('heading', {name: 'Für die Eltern und Lesebegleiter'}).isVisible());
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
