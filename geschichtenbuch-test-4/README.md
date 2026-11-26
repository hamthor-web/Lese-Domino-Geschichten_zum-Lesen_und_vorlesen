# Märchenbuch · Test 4

Eigenständige Leseprobe mit Platzhaltertexten. Die drei älteren Tests dokumentieren die Vorgeschichte. Die Integration in „Die Eiche“ und „Silvana“ ist ein späterer Arbeitsschritt.

## Gestaltung vom 26. November 2026

Die Fotovorlage zeigt einen sehr schweren Band mit dunkelbraunem, fleckig abgeriebenem Leder, hellen Kanten und einem besonders dicken, unregelmäßig gewellten Papierblock. Zwei anhand dieser Vorlage erstellte Bildmaterialien bilden die Quer- und Hochformatansicht. Die Bilder zeigen das Buch senkrecht von oben. Texte, Medien und Aufgaben liegen gerade und frei skalierbar auf den Blattflächen. Im Hochformat bleibt links nur der schmale, tiefe Falz. Dort verschwinden umgeblätterte Blätter und kommen beim Rückblättern wieder hervor. Die stärkste sichtbare Papierstaffelung liegt am unteren und äußeren Rand.

Die Papierstapel, Lederkanten und Bindung sind Bestandteile dieser Rasterbilder. Beim Blättern verlagert die Materialdarstellung die vorhandenen Papierlagen geringfügig zwischen den Seiten. Dadurch bleibt die Oberflächenstruktur auch bei wechselnden Stapelhöhen erhalten. Für das bewegte Blatt gibt es eine separate Papiertextur. Das Modul nutzt die bereits im Repository vorhandene Andika und die Aufnahme des Blättertons.

## Einbau

`story-book.js` registriert `<storybook-reader>`. `story-book.css` enthält das Layout. `materials.js` ordnet die Halbseiten, Falze und Papierlagen den Bildern zu. `turn.js` biegt ein Gitter aus Papierflächen entlang des Falzes und stellt Vorder- und Rückseite, Licht und Schatten abhängig von der Krümmung dar. Im Querformat legt sich das Blatt auf den anderen Stapel. Im Hochformat verdeckt der Falz die weggedrehte Fläche.

```html
<storybook-reader aria-label="Meine Geschichte"></storybook-reader>
<script type="module">
  import './story-book.js';

  const book = document.querySelector('storybook-reader');
  book.open({
    id: 'geschichte-v1',
    pages: [
      { title: 'Erste Seite', text: ['Absatz eins', 'Absatz zwei'] },
      { id: 'aufgabe', title: 'Aufgabe', locked: true, render({ unlocked, unlock }) {
        const button = document.createElement('button');
        button.textContent = unlocked ? 'Gelöst' : 'Lösung bestätigen';
        button.disabled = unlocked;
        button.onclick = () => {
          unlock();
          button.textContent = 'Gelöst';
          button.disabled = true;
        };
        return button;
      } },
      { title: 'Großes Bild', layout: 'spread', render() {
        const image = new Image();
        image.src = './suchbild.webp';
        image.alt = 'Beschreibung des Suchbilds';
        return image;
      } }
    ]
  });
</script>
```

- `render` kann einen DOM-Knoten mit Text, Bildern, Video, Audio oder einer Aufgabe liefern. Es kann nach einem Seiten- oder Formatwechsel erneut aufgerufen werden. Dauerhafter Aufgabenstand kann in der Geschichte gehalten werden. Das Modul speichert Leseposition und freigegebene Sperren pro Geschichten-ID im Browser.
- `layout: 'spread'` reserviert beide Seiten im Querformat und nutzt die sichtbare Seite im Hochformat.
- `pagechange` meldet die neue Position nach Abschluss eines Blattwechsels. Ein Formatwechsel erhält die genaue Position, auch wenn im Querformat zusätzlich das Nachbarblatt sichtbar wird.
- Buchgröße und Schriftgröße lassen sich unabhängig einstellen. Auf schmalen Hochformat-Displays bleibt das Buch innerhalb der Bildschirmbreite. Auf größeren Displays ist ein vergrößertes Buch scrollbar. Lange oder vergrößerte Inhalte sind auf der Seite scrollbar.
- Die untere linke und rechte Ecke können per Touch, Maus und Tastatur bedient werden. Bei reduzierter Bewegung wechselt die Ansicht direkt.
- Die animierten Blattflächen führen Papiertextur und Fließtext mit. Interaktive Inhalte und Medien werden auf den ruhenden Seiten ausgeführt.

## Browserprüfung

Chromium mit Touch-Eingabe bei 360 × 640, 390 × 844, 844 × 390, 768 × 1024, 1024 × 768 und 1440 × 900 CSS-Pixeln. Geprüft wurden das Schriftbild, die Papierkanten, die sichtbaren Zwischenbilder des Blätterns in beiden Richtungen, Zoomkombinationen, die Aufgabensperre, die Doppelseite, der Formatwechsel und die Wiederaufnahme nach Neuladen. Die Browserprüfung lief mit simulierten Bildschirmgrößen. Die Ansicht auf physischen Android- und iPad-Geräten bleibt zur Abnahme offen.
