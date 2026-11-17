# Silvana – Szene 4: Der Händler

Stand: 17. November 2026. Ergänzung der Spielakte und Masterübersicht.

## Auftrag und verbindliche Quellen

Heike beauftragt die Fortsetzung mit der nächsten Szene „Der Händler“.
Ausgangspunkt auf main: `a9220cbf70f12409b1dc051b99e51083c27e13a0`.
Berücksichtigt: aktuelle Szene-3-Spielakte, Arbeitsanweisung und bestätigter Bauplan im Repository. Die vollständige verbindliche Datei „Spinnwebenreichtum mit Spielanleitung.docx“ wurde gelesen (315 Textzeilen). Ihr Abschnitt 4 liefert Originaltext, vereinfachten Lesetext und die drei Satzkarten.
Quelle: https://chatgpt.com/library?file_id=libfile_19b3cd5618b48191b19a91d936061694&account_id=personal

## Bestätigter Ablauf

Original 4 hören → vereinfachten Text selbst lesen → drei Satzkarten in die richtige Reihenfolge bringen.

1. Der Händler spannt das Netz
2. Die Fäden kleben in seinen Haaren
3. Vom Netz bleibt fast nichts übrig

Keine zusätzliche Bildaufgabe oder Animation für diesen Abschnitt vereinbart. Keine Ersatzbilder ergänzt. Originalwortlaut aus der Bauanleitung einschließlich ungewöhnlicher Formulierungen unverändert übernommen.

## Umsetzung

- Eigener Abschnitt `szene-4/` mit HTML, Textdaten, Szenensteuerung, Gestaltung und Browserprüfung.
- Gleiche vorhandene Buttonassets und Schrift wie die vorherigen Szenen; Originalassets nicht ersetzt.
- Ein Hörbutton für Start, Pause, Fortsetzen und erneutes Hören; Originaltext aufklappbar. Navigation beendet die Wiedergabe; ausgeblendete Seite pausiert sie. Bei fehlender Vorlesefunktion bleibt der Originaltext lesbar.
- Drei zunächst falsch angeordnete Karten. Umordnen durch Ziehen mit Maus oder Touch, sichtbare Einfügelinie und Einsetzen beim Loslassen. Alternativ Karte antippen und über „Nach oben“/„Nach unten“ bewegen. Die Karten bleiben als nummerierte Reihenfolge untereinander, auch im Querformat.
- Bewertung erst mit „Reihenfolge prüfen“. Falsche Reihenfolge bleibt liegen; sanfter Hinweis und kleiner Tipp. Weiter erst nach richtiger Reihenfolge. Keine Zeitmessung.
- Lesetext bleibt während der Kartenaufgabe sichtbar. Rücknavigation innerhalb der Szene erhält Kartenreihenfolge und Lösung; „Diese Szene wiederholen“ setzt zurück.
- Getrennte Schrift- und Spielfeldregler. Große Schaltflächen, Textumbruch ohne automatische Silbentrennung, proportional erhaltene gestaltete Ränder.
- Szene-3-Abschluss erhält Weiter zu Szene 4; Rückweg aus Szene 4 führt zum Szene-3-Abschluss.
- Einführung und Szene 3 ergänzen „Der Händler“ im Szenenmenü nach dem Besuch. Vorhandene höchste Szenennummer wird nicht herabgesetzt.
- Bisherige Texte, Bilder, Animationen und Funktionen bleiben erhalten. Kein bestehendes Dokument oder Originalasset gelöscht.

## Masterübersicht – Ergänzung

Silvana / Lese-Domino bleibt in Entwicklung. Szene 4 ist implementiert; vor Veröffentlichung Browserprüfung abwarten. Szenen 1–3 bleiben erhalten. Nächster inhaltlicher Bauabschnitt ist Szene 5 „Der König“: Lesen → Wortfehler-Aufgabe laut Bauanleitung → Original 5 hören. Szene 5 wurde nicht begonnen.

## Prüfung

JavaScript-Syntax lokal geprüft. Der lokale Browserstart ist durch die Ausführungsumgebung blockiert. Die tatsächlichen Browserprüfungen laufen über den vorhandenen GitHub-Actions-Workflow. Ergebnis und Veröffentlichungsstand werden nach Abschluss unten ergänzt. Automatisierte Sprachausgabe verwendet einen simulierten Sprachdienst; keine akustische Prüfung oder Prüfung auf physischen Endgeräten.

## Abgeschlossene Prüfung und Veröffentlichung – 17.11.2026, 15:56 Uhr

Dieser Eintrag ersetzt die oben dokumentierten offenen Prüf- und Veröffentlichungsstände.

- Vor Veröffentlichung vollständiger Chrome-Prüflauf bestanden: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44107839383
- Veröffentlicht über PR #9, Merge `eedc3576f603fac6734fa44ecd5475f591e3e1e3`.
- GitHub-Pages-Bereitstellung erfolgreich; anschließend vollständige Prüfung auf der echten Live-Seite bestanden: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44108179939
- Neue Szene: je 96 Layoutprüfungen vor Veröffentlichung und live (vier Ansichten × sechs Smartphone-/Tablet-Viewports × vier Schrift-/Spielfeldkombinationen). Kein horizontaler Seitenüberlauf oder abgeschnittene Schaltflächen im geprüften Umfang.
- Geprüft: falsche Reihenfolge bleibt liegen, Weiter bleibt gesperrt; Pfeile, Maus- und echte Touch-Pointer-Ereignisse, Einfügelinie und Einsetzen; korrekte Reihenfolge; Rücknavigation und Wiederholung; Hin-/Rückweg Szene 3/4 und Menüfreischaltung. Keine JavaScript- oder HTTP-Fehler im vollständigen Durchlauf.
- Vorhandene Einführung, Bildaufgaben, Rollen/Kisten/MP4 und Domino-Bedienung bestanden ihre bisherigen Prüfungen ebenfalls.
- Zusätzliche persönliche Live-Sichtprüfung der Leseseite und Kartenansicht; Satzkarten per Verschiebeschaltfläche richtig geordnet und erfolgreiche Prüfung mit freigeschaltetem Weiter bestätigt.
- Sprachausgabe im automatisierten Lauf simuliert. Keine akustische Prüfung oder physischen Endgeräte. Keine Bildschirmaufnahmen als Projektdateien abgelegt.
- Erster Prüflauf wartete wegen einer nicht angepassten Versionsabfrage der Einführung vergeblich. Versionsparameter und Testabfrage anschließend konsistent auf Version 17 angehoben; vollständige erneute Läufe erfolgreich.

Live-Szene: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/szene-4/

Masterstatus: Szene 4 implementiert, veröffentlicht und im Browser geprüft. Gesamtprojekt weiterhin in Entwicklung. Nächster Bauabschnitt: Szene 5 „Der König“, noch nicht begonnen. Diese Datei ist der neue Nachtrag zu Spielakte und zentraler Masterübersicht; frühere Dateien bleiben als Verlauf erhalten.

## Bestätigter Nachtrag: Bildkarten und Abschlussbedienung

Heike liefert drei Bilder und beauftragt deren Verbindung mit den Satzkarten. Zuordnung:

| Satz | Gelieferte Datei | Webfassung |
|---|---|---|
| Der Händler spannt das Netz | der Händler Beginn.png | assets/haendler-netz.webp |
| Die Fäden kleben in seinen Haaren | Der Händler 2.png | assets/haendler-faeden.webp |
| Vom Netz bleibt fast nichts übrig | Der Händler 3.png | assets/haendler-rest.webp |

Bild und Satz bilden eine gemeinsame verschiebbare Karte. Die gelieferten Bilder wurden in proportionalen WebP-Fassungen für das Spiel ergänzt; die Originaldateien bleiben unverändert erhalten. Bildinhalte nicht retuschiert oder neu erzeugt. Auf kleinen Bildschirmen steht das Bild über dem Satz, auf größeren daneben. Bilder skalieren mit dem Spielfeldregler; Schrift separat.

Nach erfolgreich geprüfter Reihenfolge werden „Kleiner Tipp“ und „Reihenfolge prüfen“ ausgeblendet. Beim erneuten Umstellen wird die Lösung zurückgesetzt und die Prüfhilfe wieder sichtbar. Bloßes Auswählen einer Karte verändert den Lösungsstatus nicht. Rücknavigation erhält den aktuellen Status; Wiederholung setzt ihn zurück.

Dieser Nachtrag ersetzt den früheren Stand ohne Bildkarten. Vor Veröffentlichung werden Bildladen, feste Zuordnung, Verschieben per Maus/Touch, Aus-/Einblenden der Prüfhilfe und sechs Bildschirmgrößen mit beiden Zoomreglern geprüft.
