'use strict';

const summerStory = (() => {
  const assetPath = '../../assets/die-eiche/abschnitt-7/';
  const visits = EicheProgress.readForVisit(7);
  const reading = [
    'Im Sommer finden viele Tiere Schutz in der Eiche. Zwei Tauben bauen ein Nest. Sie haben den Streit mit den Krähen gewonnen. Nun legen sie Eier. Nach fast drei Wochen schlüpfen zwei kleine Küken.',
    'Käfer krabbeln über die raue Rinde. Sie suchen süßen Baumsaft.',
    'Ein Specht hört kleine Tiere unter der Rinde. Er klopft mit dem Schnabel gegen den Stamm und holt sie heraus. So entsteht ein Loch im Baum. Später ziehen Stare dort ein.',
    'Am Abend geht die Sonne unter. Ihr Licht fällt durch die Blätter wie ein heller Vorhang. Darin tanzen viele kleine Mücken.'
  ];
  const original = [
    'Im Sommer fanden allerlei Tiere in ihrem Blätterdach Zuflucht. Das Taubenpaar, das sich von den Krähen nicht vertreiben lassen hatte, baute ein Nest und legte seine Eier hinein, aus denen nach fast drei Wochen zwei wunderhübsche Küken schlüpften.',
    'Käfer krabbelten an der Borke des Baums herum, um nach süßem Saft zu suchen, den der Stamm mitunter absonderte. Ein Specht hatte unter der Rinde das Krabbeln von Insektenlarven, die hier ihr Unwesen trieben, gehört und hämmerte sie energisch heraus. Die Höhle, die dabei entstand, bot Staren einen Unterschlupf.',
    'Und unten fiel das sanfte Licht der untergehenden Sonne wie ein heller Vorhang durch die Blätter. Darin tanzten Mücken ihren abendlichen Reigen.'
  ];
  const choices = {
    birds: {question: 'Wer hat den Streit mit den Krähen gewonnen?', answers: ['Tauben', 'Käfer', 'Specht'], correct: 0},
    beetles: {question: 'Warum suchen die Käfer süßen Saft?', answers: [
      'Weil sie den essen möchten.', 'Weil sie ein Haus daraus bauen.', 'Weil sie darin baden möchten.', 'Weil sie ihre Schuhe damit kleben wollen.'
    ], correct: 0, retryMessages: [
      'Denk noch mal nach: Kann das stimmen?',
      'Meinst du wirklich?',
      'Klingt lustig, aber ist das wahr?',
      'Gute Idee, aber denk noch mal nach!'
    ]}
  };
  const animals = {
    pigeons: {name: 'Tauben', place: 'Nest', image: 'sommer-tauben'},
    beetle: {name: 'Käfer', place: 'Rinde', image: 'sommer-kaefer'},
    starlings: {name: 'Stare', place: 'Loch im Baum', image: 'sommer-stare'},
    mosquitoes: {name: 'Mücken', place: 'Lichtvorhang', image: 'sommer-muecken-still'}
  };
  const animalCards = {
    pigeons: animals.pigeons,
    butterflies: {name: 'Schmetterlinge', image: 'sommer-schmetterlinge'},
    beetle: animals.beetle,
    starlings: animals.starlings,
    mosquitoes: animals.mosquitoes
  };
  const pages = [
    {read: 0}, {choice: 'birds'}, {read: 1}, {choice: 'beetles'}, {read: 2},
    {read: 3}, {match: true}, {listen: true}, {crossword: true}
  ];
  const last = pages.length - 1;
  let step = Number.isInteger(visits?.step) && pages[visits.step] ? visits.step
    : visits?.page === 'crossword' ? last : 0;
  const readFlags = (saved, options) => new Set(Array.isArray(saved)
    ? saved.filter(id => Object.hasOwn(options, id)) : []);
  const answers = readFlags(visits?.answers, choices);
  const placed = readFlags(visits?.placed, animals);
  let crossword = visits?.page === 'crossword' ? visits : visits?.crossword ?? null;

  const byId = id => document.getElementById(id);
  const screen = byId('summer-screen');
  const stage = byId('oak-stage');
  const overlays = byId('oak-animals');
  const targets = byId('oak-targets');
  const next = byId('summer-next');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = null;
  let drag = null;
  let suppressClick = false;

  function save() {
    EicheProgress.save(7, {step, answers: [...answers], placed: [...placed], crossword});
  }

  function saveCrossword(state) {
    crossword = state;
    save();
  }

  function button(text) {
    const element = document.createElement('button');
    element.className = 'game-button';
    element.type = 'button';
    element.textContent = text;
    return element;
  }

  function image(asset, description = '') {
    const element = document.createElement('img');
    element.src = assetPath + asset + '.webp';
    element.alt = description;
    element.draggable = false;
    return element;
  }

  function paper(title, paragraphs = []) {
    const card = document.createElement('div');
    card.className = 'paper';
    const heading = document.createElement('h2');
    heading.id = 'summer-step';
    heading.tabIndex = -1;
    heading.textContent = title;
    card.append(heading);
    for (const text of paragraphs) {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      card.append(paragraph);
    }
    screen.replaceChildren(card);
  }

  function status(text = '') {
    const element = document.createElement('p');
    element.className = 'feedback';
    element.setAttribute('role', 'status');
    element.textContent = text;
    screen.append(element);
    return element;
  }

  function showChoice(id) {
    const choice = choices[id];
    paper(choice.question);
    const options = document.createElement('div');
    options.className = 'choices summer-choices';
    screen.append(options);
    const note = status(answers.has(id) ? 'Richtig!' : '');
    const retryMessages = choice.retryMessages ?? ['Lies noch einmal und versuche es erneut.'];
    let wrongAttempts = 0;
    next.disabled = !answers.has(id);
    choice.answers.forEach((text, index) => {
      const option = button(text);
      option.setAttribute('aria-pressed', String(answers.has(id) && index === choice.correct));
      option.onclick = () => {
        if (index !== choice.correct) {
          note.textContent = retryMessages[wrongAttempts % retryMessages.length];
          wrongAttempts += 1;
          return;
        }
        answers.add(id);
        option.setAttribute('aria-pressed', 'true');
        note.textContent = 'Richtig!';
        next.disabled = false;
        save();
      };
      options.append(option);
    });
  }

  function showAnimal(id) {
    const animal = animals[id];
    const picture = image(id === 'mosquitoes' && !motion.matches ? 'sommer-muecken' : animal.image);
    picture.className = 'oak-animal ' + id;
    overlays.append(picture);
  }

  function showMatch() {
    paper('Wo sind die Tiere?', ['Ziehe die Tiere aus dem Text an ihren Platz. Du kannst auch erst das Tier und dann seinen Platz antippen.']);
    const bank = document.createElement('div');
    bank.className = 'summer-animal-bank';
    bank.setAttribute('role', 'group');
    bank.setAttribute('aria-label', 'Tiere');
    screen.append(bank);
    const note = status();
    function update() {
      next.disabled = placed.size !== Object.keys(animals).length;
      for (const item of bank.children) {
        item.disabled = placed.has(item.dataset.animal);
        item.setAttribute('aria-pressed', String(selected === item.dataset.animal));
      }
      for (const target of targets.children) {
        const done = placed.has(target.dataset.place);
        target.disabled = done;
      }
    }

    stage.onclick = () => {
      if (selected !== 'butterflies') return;
      selected = null;
      update();
      note.textContent = 'Die passen gut hier hin. Aber hast du wirklich im Text etwas über Schmetterlinge gelesen?';
    };

    for (const [id, animal] of Object.entries(animalCards)) {
      const token = button(animal.name);
      token.prepend(image(animal.image));
      token.dataset.animal = id;
      token.onclick = event => {
        if (suppressClick) return;
        selected = selected === id ? null : id;
        update();
        if (!selected) return;
        note.textContent = animal.name + ' ausgewählt.';
        if (!event.detail) targets.querySelector('button:not(:disabled)')?.focus();
      };
      bank.append(token);
    }
    for (const [id, animal] of Object.entries(animals)) {
      const target = button('');
      target.setAttribute('aria-label', animal.place);
      target.dataset.place = id;
      target.classList.add('oak-target', id);
      target.onclick = () => {
        if (selected === 'butterflies') return;
        if (!selected) {
          note.textContent = 'Wähle zuerst ein Tier.';
          return;
        }
        if (selected !== id) {
          note.textContent = 'Dieser Platz passt noch nicht.';
          return;
        }
        const restoreFocus = document.activeElement === target;
        placed.add(id);
        selected = null;
        showAnimal(id);
        update();
        note.textContent = placed.size === Object.keys(animals).length
          ? 'Alle Tiere aus dem Text haben ihren Platz gefunden.' : animal.name + ' · ' + animal.place;
        save();
        if (restoreFocus) (next.disabled ? bank.querySelector('button:not(:disabled)') : next).focus();
      };
      targets.append(target);
      if (placed.has(id)) showAnimal(id);
    }
    update();
  }

  function showOriginal() {
    paper('Mach es dir gemütlich und höre der Geschichte zu', original);
    const controls = document.createElement('div');
    controls.className = 'read-aloud';
    const play = button('Vorlesen');
    const stop = button('Stopp');
    controls.append(play, stop);
    screen.append(controls);
    play.disabled = stop.disabled = !speech.available;
    play.onclick = () => speech.start(original.join(' '));
    stop.onclick = speech.stop;
    status(speech.available ? '' : 'Auf diesem Gerät kannst du die Geschichte mitlesen.').id = 'summer-speech-status';
  }

  const speech = createStorySpeech(() => {
    const note = byId('summer-speech-status');
    if (note) note.textContent = speech.state === 'error' ? 'Die Vorlesestimme ist gerade nicht verfügbar.' : '';
  });

  function render() {
    const page = pages[step];
    byId('summer-counter').textContent = (step + 1) + ' / ' + pages.length;
    byId('summer-back').hidden = step === 0;
    byId('summer-previous').hidden = step > 0;
    next.hidden = Boolean(page.crossword);
    next.disabled = false;
    byId('summer-crossword').hidden = !page.crossword;
    byId('story-title').hidden = byId('summer-layout').hidden = Boolean(page.crossword);
    overlays.replaceChildren();
    targets.replaceChildren();
    stage.onclick = null;
    targets.hidden = !page.match;
    if (page.crossword) return;
    if (page.read !== undefined) paper('Lies selbst', [reading[page.read]]);
    if (page.choice) showChoice(page.choice);
    if (page.match) showMatch();
    if (page.listen) {
      showOriginal();
      for (const id of Object.keys(animals)) showAnimal(id);
      const chicks = image('kueken', 'Zwei Küken im Nest');
      chicks.className = 'oak-animal chicks';
      overlays.append(chicks);
    }
    if (page.read === 2 || page.listen) {
      const woodpecker = image('sommer-specht', 'Specht auf einem Eichenast');
      woodpecker.className = 'oak-animal woodpecker';
      woodpecker.classList.toggle('at-hollow', page.read === 2);
      overlays.append(woodpecker);
    }
    if (page.read === 3) showAnimal('mosquitoes');
  }

  function changePage(direction) {
    speech.stop();
    drag?.ghost?.remove();
    drag = null;
    selected = null;
    step += direction;
    render();
    save();
    byId('summer-step')?.focus({preventScroll: true});
    window.scrollTo(0, 0);
  }

  function pointToken(event) {
    const token = event.target.closest('[data-animal]');
    if (!token || token.disabled || !event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    drag = {token, id: event.pointerId, x: event.clientX, y: event.clientY};
    token.setPointerCapture(event.pointerId);
  }

  function pointMove(event) {
    if (drag?.id !== event.pointerId) return;
    if (!drag.ghost) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
      drag.ghost = image(animalCards[drag.token.dataset.animal].image);
      drag.ghost.className = 'summer-drag-ghost';
      document.body.append(drag.ghost);
      suppressClick = true;
    }
    drag.ghost.style.transform = 'translate(' + event.clientX + 'px,' + event.clientY + 'px)';
  }

  function pointEnd(event) {
    if (drag?.id !== event.pointerId) return;
    const {token, ghost} = drag;
    drag = null;
    if (!ghost) return;
    ghost.remove();
    setTimeout(() => { suppressClick = false; }, 0);
    if (event.type !== 'pointerup') return;
    const destination = document.elementFromPoint(event.clientX, event.clientY);
    if (token.dataset.animal === 'butterflies' && stage.contains(destination)) {
      selected = 'butterflies';
      stage.click();
      return;
    }
    const target = destination?.closest('[data-place]');
    if (target && stage.contains(target)) {
      selected = token.dataset.animal;
      target.click();
      if (!placed.has(selected)) {
        selected = null;
        for (const item of screen.querySelectorAll('[data-animal]')) item.setAttribute('aria-pressed', 'false');
      }
    }
  }

  screen.addEventListener('pointerdown', pointToken);
  window.addEventListener('pointermove', pointMove);
  window.addEventListener('pointerup', pointEnd);
  window.addEventListener('pointercancel', pointEnd);
  byId('summer-back').onclick = () => changePage(-1);
  next.onclick = () => changePage(1);
  byId('infoButton').onclick = () => byId('info').showModal();
  byId('settingsButton').onclick = event => {
    const settings = byId('settings');
    settings.hidden = !settings.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!settings.hidden));
  };
  for (const [id, variable, percent] of [['letters', '--letters', false], ['boardSize', '--board', true]]) {
    byId(id).addEventListener('input', event => {
      const input = event.currentTarget;
      document.documentElement.style.setProperty(variable, percent ? input.value + '%' : input.value / 100);
      if (percent) document.documentElement.style.setProperty('--summer-board-scale', input.value / 100);
      input.nextElementSibling.value = input.value + ' %';
    });
  }
  addEventListener('pagehide', () => speech.stop());
  render();
  save();

  return {savedCrossword: crossword, saveCrossword};
})();
