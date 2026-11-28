'use strict';

const assert = require('node:assert/strict');

module.exports = async function checkSpring(context, base) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  page.setDefaultTimeout(8000);
  try {
    await page.setViewportSize({width: 390, height: 844});
    const oak = new URL('die-eiche/', base).href;
    const spring = oak + 'abschnitt-5/';
    const fourth = oak + 'abschnitt-4/';
    const next = page.locator('#next');
    const counter = page.locator('#counter');
    const replay = page.locator('.scene-menu');
    const springChoice = replay.getByRole('link', {name: 'Der Frühling beginnt'});
    await page.goto(oak);

    // Open the preceding chapter's closing page with an existing spring save.
    await page.evaluate(() => {
      localStorage.setItem('die-eiche-checkpoint-v1-4', JSON.stringify({page: 'finish'}));
      localStorage.setItem('die-eiche-checkpoint-v1-5', JSON.stringify({page: 8, found: [1, 2]}));
    });
    await page.goto(fourth);
    await page.getByRole('button', {name: 'Zum Frühling'}).click();
    await page.waitForURL(spring);
    assert.equal(await counter.innerText(), '1 / 11');
    assert.equal(new URL(page.url()).search, '');

    await next.click();
    await page.getByRole('button', {name: 'Falsch', exact: true}).click();
    assert.ok(await next.isDisabled());
    await page.getByRole('button', {name: 'Wahr', exact: true}).click();
    await next.click();
    assert.match(await page.locator('#springVideo').getAttribute('src'), /fisch\.mp4$/);
    await next.click();
    await page.getByRole('button', {name: 'Fliegen', exact: true}).click();
    await next.click();
    assert.match(await page.locator('#springVideo').getAttribute('src'), /knospe\.mp4$/);
    await next.click();
    for (const answer of ['faltig', 'grüne', 'Licht']) {
      await page.getByRole('button', {name: answer, exact: true}).click();
      assert.equal(await page.locator('.filled').innerText(), answer);
      await next.click();
    }

    assert.ok(await next.isDisabled());
    await page.locator('[data-find="3"]').click();
    assert.equal(await page.locator('#foundCount').innerText(), '1 von 4 gefunden');
    await page.getByRole('link', {name: 'Zur Spielauswahl'}).click();
    await page.getByRole('link', {name: 'Die Eiche', exact: true}).click();
    await page.getByRole('button', {name: 'Spiel fortsetzen'}).click();
    await page.waitForURL(spring);
    assert.equal(await counter.innerText(), '9 / 11');
    assert.ok(await page.locator('[data-patch="3"]').evaluate(image => image.classList.contains('visible')));
    assert.equal(await page.locator('#foundCount').innerText(), '1 von 4 gefunden');
    for (const index of [2, 1, 0]) {
      await page.locator('[data-find="' + index + '"]').press('Enter');
    }
    await next.click();

    await page.getByRole('heading', {name: 'Mach es dir gemütlich und höre der Geschichte zu'}).waitFor();
    assert.match(await page.locator('.paper p').innerText(), /dann streckten sie sich voller Lebenslust ins Licht\.$/);
    await page.locator('#infoButton').click();
    const info = page.getByRole('dialog');
    assert.deepEqual(await info.getByRole('link').allTextContents(), [
      'Impressum', 'Datenschutz', 'Website der Entwicklerin', 'Nachricht an die Entwicklerin'
    ]);
    await info.getByRole('button', {name: 'Schließen'}).click();
    await next.click();
    await page.locator('#bookTitle').waitFor();
    assert.deepEqual(await page.locator('#bookTitle span').allTextContents(), ['Die Freude', 'der Eiche']);

    await page.goto(fourth);
    await replay.locator('summary').click();
    await springChoice.click();
    await page.waitForURL(spring);
    assert.equal(await counter.innerText(), '1 / 11');

    const joy = oak + 'abschnitt-6/';
    await page.evaluate(() => {
      localStorage.setItem('die-eiche-checkpoint-v1-5', JSON.stringify({page: 10}));
      localStorage.setItem('die-eiche-checkpoint-v1-6', JSON.stringify({
        page: 2, pairs: [[1, 5], [3, 7], [9, 2], [8, 0]], nonsenseWord: 'Wolkensocken'
      }));
    });
    await page.goto(spring);
    await page.getByRole('button', {name: 'Weiter zu Die Freude der Eiche'}).click();
    await page.waitForURL(joy);
    assert.equal(await counter.innerText(), '1 / 4');
    assert.equal(new URL(page.url()).search, '');
    await next.click();
    const word = name => page.getByRole('button', {name, exact: true}).and(page.locator('[data-part]'));
    async function combineWords(first, second) {
      await word(first).click();
      await word(second).click();
    }
    await combineWords('Liebe', 'Mutter');
    await page.getByRole('button', {name: 'Liebemutter wieder trennen'}).click();
    await combineWords('Mutter', 'Liebe');
    await combineWords('Socken', 'Wolken');
    await page.getByRole('img', {name: 'Zwei lachende Knetwolken tragen blaue Socken.'}).waitFor();

    await page.getByRole('link', {name: 'Zur Spielauswahl'}).click();
    await page.getByRole('link', {name: 'Die Eiche', exact: true}).click();
    await page.getByRole('button', {name: 'Spiel fortsetzen'}).click();
    await page.waitForURL(joy);
    assert.equal(await counter.innerText(), '2 / 4');
    await page.getByRole('button', {name: 'Mutterliebe', exact: true}).waitFor();
    await page.getByRole('img', {name: 'Zwei lachende Knetwolken tragen blaue Socken.'}).waitFor();
    assert.ok(await next.isDisabled());
    for (const [first, second] of [['Eichen', 'Baum'], ['hell', 'grün'], ['Sonnen', 'Schein']]) {
      await combineWords(first, second);
    }
    await next.click();
    await page.getByRole('heading', {name: 'Jetzt höre der Geschichte zu!'}).waitFor();
    await page.reload();
    assert.equal(await counter.innerText(), '3 / 4');
    await next.click();
    await page.getByRole('heading', {name: 'Sommer', exact: true}).waitFor();
    await page.reload();
    await page.getByRole('heading', {name: 'Sommer', exact: true}).waitFor();
    assert.equal(await counter.innerText(), '4 / 4');

    await page.goto(oak);
    await page.getByRole('button', {name: 'Spiel zurücksetzen'}).click();
    assert.ok(await page.getByRole('button', {name: 'Spiel fortsetzen'}).isDisabled());
    assert.equal(await page.evaluate(() => localStorage.getItem('die-eiche-checkpoint-v1-5')), null);
    assert.equal(await page.evaluate(() => localStorage.getItem('die-eiche-checkpoint-v1-6')), null);
    assert.deepEqual(errors, []);
    console.log('PASS: Frühlingsabschnitt und Die Freude der Eiche, Spielstand, Abschnittswahl, Info-I und Buchausblicke.');
  } finally {
    await page.evaluate(() => EicheProgress.reset()).catch(() => {});
    await page.close();
  }
};
