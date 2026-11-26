import './story-book.js';

const book = document.querySelector('storybook-reader');

book.open({
  id: 'fotobuch-probe-2026-11',
  pages: [
    { title: 'Die erste Seite', text: 'Hier beginnt eine Lesegeschichte. Blättere an der rechten unteren Ecke um.' },
    { title: 'Ein Blatt Papier', text: 'Schau dir die Ränder an. Jede Lage Papier sieht ein wenig anders aus.' },
    { id: 'aufgabe', title: 'Platz für eine Aufgabe', locked: true, render({ unlock, unlocked }) {
      const task = document.createElement('div');
      const prompt = document.createElement('p');
      prompt.textContent = 'Welches Wort passt zum Buch?';
      const feedback = document.createElement('p');
      feedback.setAttribute('role', 'status');
      const choices = document.createElement('div');
      choices.className = 'choices';
      for (const word of ['Papier', 'Sand']) {
        const answer = document.createElement('button');
        answer.type = 'button';
        answer.textContent = word;
        answer.addEventListener('click', () => {
          feedback.textContent = word === 'Papier' ? 'Genau! Du kannst weiterblättern.' : 'Lies noch einmal.';
          if (word === 'Papier') {
            unlock();
            choices.hidden = true;
          }
        });
        choices.append(answer);
      }
      if (unlocked) {
        choices.hidden = true;
        feedback.textContent = 'Genau! Du kannst weiterblättern.';
      }
      task.append(prompt, choices, feedback);
      return task;
    } },
    { title: 'Noch ein Absatz', text: 'Auf dieser Seite stehen später weitere Sätze. Du kannst die Schrift oben größer stellen.' },
    { title: 'Platz für ein Suchbild', layout: 'spread', text: 'Hier ist Platz für ein Bild auf beiden Buchseiten. Im Hochformat steht dafür die ganze sichtbare Seite zur Verfügung.' },
    { title: 'Platz für eine Hörgeschichte', text: 'Hier könnten später eine Aufnahme und ein kurzer Text stehen.' },
    { title: 'Das letzte Blatt', text: 'Die Leseprobe ist zu Ende. An der linken Ecke kannst du zurückblättern.' }
  ]
});
