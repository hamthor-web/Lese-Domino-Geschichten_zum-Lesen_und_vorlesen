# Die Eiche · Buchprobe auf dem Bildschirm

Testabzug der drei spielbaren Web-Abschnitte „Die Eiche“, „Spuren der Zeit“ und „Winterschlaf“ aus Commit `b86404a`. Die Abschnitte verwenden ihre vorhandenen Lesetexte, Suchbilder, Aufgaben, Tonaufnahmen, Animationen und interne Seitennavigation. Die Probe verwendet die Buchhülle von Test 4. Sie legt das vorhandene Spielfeld auf eine Einzel- oder Doppelseite und behält für die Abschnitte ihre bisherige Blätterlogik.

Der Abschnitt lässt sich für die Abnahme direkt auswählen. „Mehr Platz“ gibt derselben laufenden Szene die ganze Fläche unter der Vergleichsleiste. „Buch zeigen“ setzt sie wieder in die Buchhülle. Beide Ansichten verwenden denselben Spielstand in der Probe. Auf der Buchfläche stehen die Lesetexte direkt auf dem Papier. Auf breiteren Querformat-Ansichten liegen Bild und Lesetext nebeneinander. Inhalte sind bei Bedarf vertikal scrollbar.

## Gemessene Fläche

Die Werte sind CSS-Pixel und bezeichnen das sichtbare Spielfenster unter der Auswahlleiste. Gemessen im Chromium-Browser mit simulierter Touch-Bedienung.

| Bildschirm | Im Buch | Mehr Platz | Anteil der Fläche |
| --- | --- | --- | --- |
| 390 × 844 | 335 × 492 | 390 × 792 | 53 % |
| 844 × 390 | 424 × 274 | 844 × 338 | 41 % |
| 768 × 1024 | 566 × 833 | 768 × 972 | 63 % |
| 1024 × 768 | 878 × 567 | 1024 × 716 | 68 % |

Beim kurzen Handy-Querformat bestimmt die Höhe, wie breit ein vollständiges Buch mit dem vorhandenen Seitenverhältnis werden kann. Im Beispiel bleiben dadurch rund 50 Prozent der verfügbaren Breite und 41 Prozent der verfügbaren Fläche für das Spielfenster. Die Zahlen beziehen sich auf diese Buchprobe.

## Technischer Stand

`abzug.py` erzeugt die drei HTML-Abzüge und den isolierten Spielstand. Die Abzüge laden Bild, Ton und Video über die vorhandenen Repository-Pfade. Der Vorschaurahmen hält das Spielfenster beim Format- und Ansichtswechsel geöffnet. Die Buchhülle wird mit dem bestehenden Buchmodul gerendert. Größenregler und Bedienelemente der Eiche bleiben im Spielfenster.

Geprüft wurden die Start- und Leseseite, die drei Abschnittseinstiege, der Wechsel zwischen Buch und größerer Ansicht im selben Spielschritt, der gespeicherte Leseschritt nach Neuladen, die getrennten Speicherschlüssel und der Formatwechsel. Die Geräteflächen wurden simuliert.
