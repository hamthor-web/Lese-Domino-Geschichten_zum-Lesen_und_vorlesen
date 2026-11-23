'use strict';

const reading = document.getElementById('silvana-reading');
const status = reading.querySelector('[role="status"]');
let speech;

fetch('../szene-14/assets/vorlesetext.json')
  .then(response => {
    if (!response.ok) throw new Error('Vorlesetext fehlt');
    return response.json();
  })
  .then(text => {
    if (typeof text.full !== 'string' || !text.full.trim()) throw new Error('Vorlesetext fehlt');
    status.hidden = true;
    speech = mountStoryReading(reading, text.full, {
      id: 'silvana-listen', title: 'Die ganze Geschichte', label: 'Geschichte vorlesen',
      readingLabel: 'Ganze Geschichte mitlesen'
    });
  })
  .catch(() => {
    status.hidden = false;
    status.textContent = 'Der Vorlesetext konnte nicht geladen werden.';
  });

addEventListener('pagehide', () => speech?.stop());
