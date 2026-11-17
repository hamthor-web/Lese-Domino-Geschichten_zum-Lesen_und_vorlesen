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
