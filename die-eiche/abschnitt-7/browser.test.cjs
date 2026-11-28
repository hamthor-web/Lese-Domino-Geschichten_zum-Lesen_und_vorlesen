'use strict';

const assert = require('node:assert/strict');

const entries = [
  ['SPECHT', 2, 0, false], ['SONNE', 6, 1, false],
  ['EIER', 0, 2, true], ['KÜKEN', 8, 0, false],
  ['TAUBEN', 2, 5, true], ['RINDE', 4, 3, true], ['NEST', 0, 1, false]
];

module.exports = async function checkSummer(context, base) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const oak = base + 'die-eiche/';
  const summer = oak + 'abschnitt-7/';
  const tile = (row, column) => page.getByRole('textbox', {name: `Buchstabenfeld ${row + 1}, ${column + 1}`, exact: true});
  const clues = page.locator('#clues button');
  const count = page.locator('#count');
  const marker = word => page.locator('.marker').and(page.getByRole('img', {name: word, exact: true}));
  try {
    await page.setViewportSize({width: 393, height: 852});
    await page.goto(oak);
    await page.evaluate(() => {
      localStorage.setItem('die-eiche-checkpoint-v1-6', JSON.stringify({
        page: 3, pairs: [[1, 5], [3, 7], [9, 2], [8, 0]], nonsenseWord: 'Wolkensocken'
      }));
    });
    await page.goto(oak + 'abschnitt-6/');
    await page.getByRole('button', {name: 'Weiter zu Sommer'}).click();
    await page.waitForURL(summer);
    await page.getByRole('heading', {name: 'Lies selbst', exact: true}).waitFor();
    assert.equal(await page.locator('#story p').count(), 4);
    await page.getByRole('button', {name: 'Weiter zum Kreuzworträtsel'}).click();
    await page.emulateMedia({reducedMotion: 'no-preference'});
    assert.match(await count.innerText(), /^0 von 7/);
    assert.equal(await page.locator('.marker, .reward, #clues img').count(), 0);

    await page.getByRole('button', {name: 'Lesetext erneut lesen'}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.locator('p').count(), 4);
    await dialog.getByRole('button', {name: 'Schließen'}).click();
    await dialog.waitFor({state: 'hidden'});

    await page.evaluate(() => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.speak = utterance => {
        document.body.dataset.spoken = utterance.lang + ' ' + utterance.text;
        utterance.onend();
      };
    });
    await page.getByRole('button', {name: 'Frage vorlesen'}).click();
    assert.equal(await page.locator('body').getAttribute('data-spoken'), 'de-DE Welcher Vogel klopft gegen den Baum?');

    await clues.nth(0).click();
    await page.keyboard.type('SP');
    assert.equal(await tile(2, 2).evaluate(input => input === document.activeElement), true);
    await tile(2, 2).fill('X');
    assert.match(await count.innerText(), /^0 von 7/);

    async function playWord(index) {
      const [word, row, column, down] = entries[index];
      await clues.nth(index).click();
      for (const [offset, letter] of [...word].entries()) {
        const field = tile(row + (down ? offset : 0), column + (down ? 0 : offset));
        if (await field.evaluate(input => input.readOnly)) assert.equal(await field.inputValue(), letter);
        else await field.fill(letter);
      }
      const reward = page.locator('.reward');
      await reward.waitFor();
      const firstFrame = await reward.boundingBox();
      assert.ok(firstFrame.width > 100);
      assert.equal(await marker(word).count(), 0);
      await page.waitForFunction(width => {
        const image = document.querySelector('.reward');
        return image && image.offsetWidth < width * .85;
      }, firstFrame.width);
      if (index === 0) await page.setViewportSize({width: 844, height: 390});
      await marker(word).waitFor();
      const wordStart = await tile(row, column).boundingBox();
      const icon = await marker(word).boundingBox();
      if (down) assert.ok(icon.y + icon.height < wordStart.y);
      else assert.ok(icon.x + icon.width < wordStart.x);
    }
    await playWord(0);
    await clues.nth(2).click();
    await tile(0, 2).fill('E');
    await page.getByRole('link', {name: 'Zur Spielauswahl'}).click();
    await page.getByRole('link', {name: 'Die Eiche', exact: true}).click();
    await page.getByRole('button', {name: 'Spiel fortsetzen'}).click();
    await page.waitForURL(summer);
    assert.match(await count.innerText(), /^1 von 7/);
    await marker('SPECHT').waitFor();
    assert.equal(await tile(0, 2).inputValue(), 'E');
    assert.equal(await tile(2, 2).evaluate(input => input.readOnly), true);
    assert.equal(await page.locator('.reward').count(), 0);

    for (const [width, height] of [[393, 852], [844, 390], [1440, 900], [320, 640]]) {
      await page.setViewportSize({width, height});
      const board = await page.locator('#grid').boundingBox();
      const scene = await page.locator('.summer-scene').boundingBox();
      assert.ok(board.x >= scene.x && board.x + board.width <= scene.x + scene.width);
      assert.ok(board.y >= scene.y && board.y + board.height <= scene.y + scene.height);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      assert.equal(await marker('SPECHT').count(), 1);
    }
    for (const index of [1, 2, 3, 4, 5, 6]) await playWord(index);
    assert.match(await count.innerText(), /^7 von 7/);
    assert.equal(await page.locator('.cell:not(.solved)').count(), 0);
    await page.getByRole('status').filter({hasText: 'alle sieben Wörter gefunden'}).waitFor();
    await page.reload();
    assert.equal(await page.locator('.marker:visible').count(), 7);

    const replayMenu = page.getByText('Anderen Abschnitt', {exact: false}).first();
    await replayMenu.click();
    await page.getByRole('link', {name: 'Sommer', exact: true}).click();
    await page.getByRole('heading', {name: 'Lies selbst', exact: true}).waitFor();
    await page.getByRole('button', {name: 'Weiter zum Kreuzworträtsel'}).click();
    assert.match(await count.innerText(), /^0 von 7/);

    await page.goto(oak);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', {name: 'Spiel zurücksetzen'}).click();
    assert.ok(await page.getByRole('button', {name: 'Spiel fortsetzen'}).isDisabled());
    assert.equal(await page.evaluate(() => localStorage.getItem('die-eiche-checkpoint-v1-7')), null);
    assert.deepEqual(errors, []);
    console.log('PASS: Sommer, Buchübergang, Kreuzungen, Bilder, Drehung, Spiel fortsetzen, Wiederholen und Zurücksetzen.');
  } finally {
    await page.evaluate(() => EicheProgress.reset()).catch(() => {});
    await page.close();
  }
};
