# Silvana – Szene 8: Der wütende König
Stand: 18.11.2026 – bestätigte Korrektur

## Verbindliche Quellen
- Spinnwebenreichtum mit Spielanleitung.docx, Abschnitt 8
- BAUPLAN_ENTSCHEIDUNGEN_2026-11-16.md
- ausdrückliche neue Entscheidung: Kapitel „Der wütende König“ statt „Der enttäuschte König“

## Ablauf
1. Vereinfachten Original-Lesetext aus der Bauanleitung selbst lesen (König schnaubt wütend, Samtkiste fällt, Rückreise)
2. Weiter zum Gefühlsverständnis: wütend 😠, traurig 😢, fröhlich 😊; korrekt ist wütend
3. Erst nach richtiger Gefühlswahl erscheinen die drei Antworten:
   - „Der König ist wütend, weil er nur Spinnweben gesehen hat.“ **richtig**
   - „Der König ist wütend, weil ihn die Sonne blendet.“
   - „Der König ist wütend, weil sein Mantel schmutzig geworden ist.“
4. Nach richtiger Begründung zeigt die Abschlussansicht einen Weiter-Button zur nächsten Szene
5. Erst auf Klick wird das von Heike gelieferte `assets/Wuerstchen_Animation.mp4` genau einmal gespielt, ohne loop; danach Weiterleitung zu Szene 9, sofern die Seite existiert. Bis Szene 9 vorliegt, folgt eine verständliche Hinweisansicht statt eines 404-Fehlers.
6. Der Originaltext von Szene 8 wird weiterhin nicht in Szene 8 vorgelesen: Er gehört gebündelt mit Original 9 zum Hörschritt von Szene 9.

## Technischer Stand
- Korrigiert: `szene-8/content.json`, `szene-8/scene.js`, `szene-8/index.html`, `szene-8/scene.css`
- Szenenmenü in Einführung und Szene 7 angepasst; der Pfad `szene-8/` bleibt zur Wahrung vorhandener Links bestehen
- Königsbild und Würstchen-MP4 im GitHub-Repository geprüft
- Bild des Königs zeigt weiterhin die bisherige Illustration, ungeachtet der jetzt geänderten Gefühlsaufgabe
- Keine Änderung am Textinhalt der ursprünglichen Geschichte; nur Szenentitel und Verständnisaufgabe geändert

## Offene Arbeiten
- Browser- und Gerätetest (Smartphone/Tablet, Hoch- und Querformat, beide unabhängigen Größenregler)
- Bilddarstellung: prüfen, ob Mimik des Königs zum neuen Gefühlsziel „wütend“ deutlich genug passt
- Szene 9 entwickeln und verlinken; dann den Übergang mit tatsächlicher Navigation abschließend prüfen
- Zentrale Projektakte und Masterübersicht bei nächster Gesamtaktualisierung ergänzen

Ältere Projektakten bleiben als Versionshistorie erhalten.
