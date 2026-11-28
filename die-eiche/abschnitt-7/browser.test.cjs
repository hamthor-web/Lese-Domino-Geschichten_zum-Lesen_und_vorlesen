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
    const next = page.getByRole('button', {name: 'Weiter', exact: true});
    const clip = page.locator('#summer-video');
    async function playFilm(file) {
      assert.match(await clip.getAttribute('src'), new RegExp(file + '\\.mp4$'));
      assert.ok(await clip.isVisible());
      assert.ok(!await page.locator('#oak-stage').isVisible());
      await page.getByRole('button', {name: 'Abspielen', exact: true}).click();
      await page.waitForFunction(() => document.querySelector('#summer-video').currentTime > .05);
    }
    await page.getByText(/Im Sommer finden viele Tiere Schutz/).waitFor();
    await page.getByRole('link', {name: 'Zur Spielauswahl'}).click();
    await page.getByRole('link', {name: 'Die Eiche', exact: true}).click();
    await page.getByRole('button', {name: 'Spiel fortsetzen'}).click();
    await page.waitForURL(summer);
    await page.getByText(/Im Sommer finden viele Tiere Schutz/).waitFor();
    assert.equal(await page.getByRole('heading', {name: 'Kreuzworträtsel', exact: true}).count(), 0);
    const paperText = page.locator('.paper p');
    const artwork = page.locator('#oak-stage');
    const initialFont = await paperText.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
    const initialArtwork = await artwork.boundingBox();
    await page.getByRole('button', {name: 'Aa · Größe ändern'}).click();
    await page.locator('#letters').fill('150');
    assert.ok(await paperText.evaluate(node => parseFloat(getComputedStyle(node).fontSize)) > initialFont);
    assert.equal((await artwork.boundingBox()).width, initialArtwork.width);
    await page.locator('#boardSize').fill('75');
    assert.ok((await artwork.boundingBox()).width < initialArtwork.width);
    await page.locator('#letters').fill('100');
    await page.locator('#boardSize').fill('100');
    await page.getByRole('button', {name: 'Aa · Größe ändern'}).click();
    await page.getByRole('button', {name: 'Informationen und Kontakt'}).click();
    const info = page.getByRole('dialog');
    await info.waitFor();
    assert.equal(await info.getByRole('link').count(), 4);
    await info.getByRole('button', {name: 'Schließen'}).click();

    await next.click();
    await page.getByRole('button', {name: 'Specht', exact: true}).click();
    assert.ok(await next.isDisabled());
    await page.getByRole('button', {name: 'Tauben', exact: true}).click();
    await next.click();
    await page.getByText(/Käfer krabbeln über die raue Rinde/).waitFor();
    await playFilm('sommer-kaefer-krabbelt');
    await next.click();
    assert.ok(await clip.evaluate(video => video.paused));
    assert.ok(!await clip.isVisible());
    assert.equal(await page.locator('.summer-choices button').count(), 4);
    for (const [answer, prompt] of [
      [/darin baden/, 'Denk noch mal nach: Kann das stimmen?'],
      [/ein Haus/, 'Meinst du wirklich?'],
      [/Schuhe/, 'Klingt lustig, aber ist das wahr?'],
      [/darin baden/, 'Gute Idee, aber denk noch mal nach!']
    ]) {
      await page.getByRole('button', {name: answer}).click();
      await page.getByRole('status').filter({hasText: prompt}).waitFor();
      assert.ok(await next.isDisabled());
    }
    await page.getByRole('button', {name: /den essen/}).click();
    await next.click();
    await page.getByText(/Ein Specht hört kleine Tiere unter der Rinde/).waitFor();
    await playFilm('sommer-specht-haemmert');
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await next.click();
    await page.getByText(/Am Abend geht die Sonne unter/).waitFor();
    assert.ok(await clip.evaluate(video => video.paused));
    assert.ok(!await clip.isVisible());
    const insects = page.locator('#oak-animals .mosquitoes');
    assert.match(await insects.getAttribute('src'), /sommer-muecken\.webp/);
    await insects.evaluate(img => img.decode());
    await next.click();
    await page.emulateMedia({reducedMotion: 'reduce'});
    const token = name => page.getByRole('group', {name: 'Tiere', exact: true}).getByRole('button', {name, exact: true});
    const spot = name => page.getByRole('group', {name: 'Plätze an der Eiche'}).getByRole('button', {name, exact: true});
    const butterflyHint = 'Die passen gut hier hin. Aber hast du wirklich im Text etwas über Schmetterlinge gelesen?';
    assert.deepEqual(await page.locator('.oak-target').allTextContents(), ['', '', '', '']);
    assert.equal(await spot('Nest').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)');
    await token('Schmetterlinge').tap();
    await spot('Nest').tap();
    await page.getByRole('status').filter({hasText: butterflyHint}).waitFor();
    assert.equal(await page.locator('#oak-animals img').count(), 0);
    assert.ok(await next.isDisabled());
    await token('Tauben').tap();
    await spot('Rinde').tap();
    assert.ok(await next.isDisabled());
    await spot('Nest').tap();
    await page.getByRole('link', {name: 'Zur Spielauswahl'}).click();
    await page.getByRole('link', {name: 'Die Eiche', exact: true}).click();
    await page.getByRole('button', {name: 'Spiel fortsetzen'}).click();
    await page.waitForURL(summer);
    assert.ok(await token('Tauben').isDisabled());
    assert.equal(await page.locator('#oak-animals .pigeons').count(), 1);

    await page.setViewportSize({width: 1100, height: 800});
    async function dragTo(animal, target, horizontal = .5, vertical = .5) {
      await token(animal).scrollIntoViewIfNeeded();
      const source = await token(animal).boundingBox();
      const destination = await target.boundingBox();
      await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
      await page.mouse.down();
      await page.mouse.move(destination.x + destination.width * horizontal, destination.y + destination.height * vertical, {steps: 12});
      await page.mouse.up();
    }
    await dragTo('Schmetterlinge', artwork, .15, .8);
    await page.getByRole('status').filter({hasText: butterflyHint}).waitFor();
    assert.equal(await page.locator('#oak-animals img').count(), 1);
    await dragTo('Käfer', spot('Rinde'));
    assert.ok(await token('Käfer').isDisabled());
    await token('Stare').tap();
    await spot('Loch im Baum').tap();
    await token('Mücken').tap();
    await spot('Lichtvorhang').tap();
    await page.locator('#oak-animals .mosquitoes').waitFor();
    assert.equal(await page.locator('#oak-animals img').count(), 4);
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await next.click();
    const original = page.locator('#summer-screen .paper p');
    assert.equal(await page.locator('#oak-animals img').count(), 6);
    await page.locator('#oak-animals img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert.equal(await original.count(), 3);
    assert.match(await original.first().innerText(), /^Im Sommer fanden allerlei Tiere/);
    assert.match(await original.last().innerText(), /Mücken ihren abendlichen Reigen\.$/);
    await page.evaluate(() => {
      window.speechSynthesis.speak = utterance => {
        window.summerSpoken = (window.summerSpoken || '') + utterance.text;
        utterance.onend();
      };
    });
    await page.getByRole('button', {name: 'Vorlesen', exact: true}).click();
    assert.match(await page.evaluate(() => window.summerSpoken), /abendlichen Reigen/);
    await next.click();
    await page.setViewportSize({width: 393, height: 852});
    await page.getByRole('heading', {name: 'Kreuzworträtsel', exact: true}).waitFor();
    await clues.first().waitFor();
    assert.match(await count.innerText(), /^0 von 7/);
    assert.equal(await page.locator('.marker, .reward, #clues img').count(), 0);

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
    await page.evaluate(() => {
      const key = 'die-eiche-checkpoint-v1-7';
      const checkpoint = JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify({...checkpoint.crossword, page: 'crossword'}));
    });
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
    await page.getByText(/Im Sommer finden viele Tiere Schutz/).waitFor();
    assert.equal(await page.locator('.marker:visible').count(), 0);

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
