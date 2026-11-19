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
      await button('no').click();
      assert.equal(await questionCount(),3);
      await button('no').click();
      assert.equal(await questionCount(),3);
      await checkWidth('Aufgabe', width, height, font, board);
      await button('yes').click();
      assert.equal(await questionCount(),2);
      assert(await page.locator('#queenPicture .speech-bubble').isVisible());
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
  await button('nextScene').click();
  await button('transitionStatus').waitFor({state:'visible'});
  await button('retry').click();
  assert.equal(await questionCount(),1);
  for (const path of ['vorschau-einfuehrung/','szene-2/','szene-12/']) {
    await page.goto(base + path);
    assert.equal(await button('sceneMenu13').textContent(),'Zu Hause');
  }
  assert.deepEqual(errors,[]);
  await browser.close();
  server.close();
  console.log('24 Geräte-/Zoomkombinationen, Fragenfolge, Erzählen, MP4 und Szenenmenü geprüft.');
})().catch(error => { console.error(error); process.exit(1); });
