# Silvana – Spielakte Szene 3: Die Spinnen im Wald
Stand: 17.11.2026, 01:09 Uhr Europe/Berlin

## Auftrag und Quellen
Heike: „So jetzt ist alles oben. Fang schon mal mit der dritten Szene an.“
Aktueller main-Ausgangspunkt: `4a43fd4eac63df02d0737c5190504bf211a11864`.
Aktuelle Spielakte Szene 2 und Repository-Bauplan vollständig gelesen.
`Spinnwebenreichtum mit Spielanleitung.docx` vollständig gelesen (315 extrahierte Textzeilen, 16 Seiten; aktueller Inhalt direkt verfügbar).
Quelle: https://chatgpt.com/library?file_id=libfile_19b3cd5618b48191b19a91d936061694&account_id=personal

Die am 16.11. bestätigte neuere Bauanleitung ersetzt hier die ältere Dominoaufgabe.
Ablauf: vereinfachten Text lesen → Bildvergleich / Farbe schreiben → Originalabschnitt 3 hören → Abschluss.
Lesetext und vollständiger Originalabschnitt aus der aktuellen Word-Anleitung, keine Rekonstruktion aus älteren Texten.
Die ältere Zusammenfassung und Szene 1/2 bleiben als Verlauf erhalten.

## Entwicklungsstand
Vorbereitung auf separatem Zweig `entwicklung/szene-3-spinnen`, ausdrücklich noch keine Freigabe oder Veröffentlichung auf GitHub Pages.
Neue Dateien unter `szene-3/`: HTML, CSS, Szenensteuerung, Textdaten, unabhängige Antwortlogik und wiederholbarer Antworttest.
Originale gemeinsame Buttonassets und Schrift werden referenziert, keine vorhandenen Bilddateien ersetzt.
Die vier zuletzt ergänzten Szene-2-Assets sind im GitHub-Baum vorhanden: Rolle, Sonne, Regen, Weiter-MP4.

## Interaktion
- Zwei Vergleichsbilder mit neutralen Beschriftungen „Bild 1“ / „Bild 2“; die Lösung wird in sichtbaren Bildunterschriften nicht vorweggenommen.
- „grau“ und flektierte Formen sowie die Varianten „graun“ / „grauh“ werden angenommen, Groß-/Kleinschreibung ignoriert.
- „blau“ benennt den Fehler und führt zur Nachfrage nach der richtigen Farbe. Es beendet die Aufgabe nicht.
- „Spinnen“ / „Farbe“ erhalten passende Nachfragen.
- Verneinte richtige Farbe („nicht grau“) und als falsch bezeichnetes Grau werden nicht als Lösung gewertet.
- Mehrdeutige Nennung „blau oder grau“ führt zu einer Nachfrage.
- Nach drei sachlich falschen Antworten vier Buchstabenfelder für „grau“, ein zufällig vorgegebener richtiger Buchstabe an richtiger Position.
- Teilantworten, leere Eingaben und gezielte Nachfragen erhöhen den Fehlerzähler nicht. Dies ist die im Bauplan als Vorschlag markierte Implementierungsentscheidung, keine nachträglich behauptete Nutzerbestätigung.
- Hilfe bleibt beim Zurückgehen erhalten. „Diese Szene wiederholen“ setzt sie und den Fehlerzähler zurück.
- Sprachausgabe erst nach gelöster Aufgabe, mit Pause/Fortsetzen, Neustart, Originaltext zum Aufklappen; Navigation beendet Sprache und ignoriert alte Sprachereignisse.
- Beide Größenregler wirken getrennt; Bilder proportional, Layout darf umbrechen.
- Schrift- und Spielfeldparameter entsprechen zunächst Szene 2 (90–160 % / 80–160 %).

## Vorbereitete Verknüpfung
Änderungen im Entwicklungszweig, nicht auf main:
- Szene-2-Abschluss bekommt zusätzlich „Weiter“ zu Szene 3; bestehende Wiederholung und Einführung bleiben erhalten.
- Rücksprung von Szene 3 führt zum Abschluss von Szene 2.
- Szenenmenüs ergänzen Szene 3 erst nach Besuch. Ein erneuter Besuch von Szene 2 darf den lokal erreichten Höchststand nicht mehr von 3 auf 2 zurücksetzen.
- Die vorhandene Rollen-, Kisten- und Weiter-MP4-Logik bleibt unverändert.

## Prüfungen
- 26 Antwortfälle und Zustands-/Hilferegeln im verfügbaren JavaScript-V8-Laufzeitkontext erfolgreich ausgeführt.
- JavaScript für Szene 3, geänderte Szene 2 und Einführung kompiliert.
- Wiederholbarer Test für lokale Weiterarbeit: `node szene-3/answers.test.cjs`. In dieser Sitzung wurde der gleiche Testkörper in V8 mit Assertions ausgeführt; Node selbst ist nicht verfügbar.
- Kein tatsächlicher Browser-, Layout-, Touch-, Sprach- oder GitHub-Pages-Test dieser neuen Szene möglich: lokale Ausführungsumgebung meldet „No usable execution environment is available“.
- Keine Behauptung, die neue Szene sei bereits spielbereit oder auf Geräten geprüft.

## Offen vor Zusammenführung / Freigabe
1. Zwei Originalvergleichsbilder liefern bzw. gestalten: gleicher Wald, identischer Ausschnitt, gleiche Perspektive, alle gemeinsamen Elemente an exakt denselben Positionen; ausschließlich Spinnenfarbe grau / blau verschieden.
2. Erwartete Dateien: `assets/spinnen-grau.png`, `assets/spinnen-blau.png`. Im aktuellen Repository fehlen diese. Keine Ersatzzeichnung erfunden; Bildaufgabe bleibt bei fehlenden Bildern gesperrt.
3. Die Bildformate und Farbunterschiede visuell prüfen; insbesondere keine anderen blauen Elemente als Fehlersignal missverstehen lassen.
4. Echtes Browserdurchspielen inklusive Rücknavigation, Menüfreischaltung, Hilfe nach 3 Fehlversuchen und Sprachausgabe.
5. Smartphone/Tablet Hoch-/Querformat und getrennte Zoomwerte (100/100, 160/100, 100/160, 160/160) prüfen, keine abgeschnittenen Inhalte.
6. Danach aktuelle main-Änderungen abgleichen, Entwicklungszweig zusammenführen, GitHub Pages live prüfen und zentrale Projekt-Masterübersicht synchronisieren.
