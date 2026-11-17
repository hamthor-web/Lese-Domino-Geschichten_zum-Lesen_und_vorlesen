# Masterübersicht – Nachtrag Silvana / Szene 3
Stand: 17.11.2026 – Bildauswahl und Abenteuerübergänge veröffentlicht

| Bereich | Aktueller Stand |
|---|---|
| Einführung / Szene 2 | Vorhandene Funktionen und Originalassets erhalten. Animierter Weiter-Button führt nach dem Abspielen direkt zu Szene 3. |
| Szene 3 „Die Spinnen im Wald“ | Auf main und GitHub Pages veröffentlicht: Lesen, Original-Bildvergleich, Farbeingabe, Buchstabenhilfe, Original-Hörteil und Abschluss. |
| Bilder | Originale graue und blaue Spinnenbilder vorhanden; beide live geladen, gleiche Abmessungen 1448×1086. Kein pixelgenauer Vergleich behauptet. |
| Bildauswahl | Zuerst das nicht passende Bild wählen. Blaue Spinnen öffnen den Dialog; graue Spinnen geben einen Hinweis. Wiederholung setzt die Auswahl zurück. |
| Übergangstexte | „Szene … geschafft“ entfällt. Über Weiter-Schaltflächen zu nächsten Abschnitten steht „Jetzt geht das Abenteuer weiter.“ |
| Antwortfelder | Bestätigte Korrektur umgesetzt: erkannter Fehler bleibt im ersten Feld; richtige Farbe und Buchstabenhilfe in separatem zweiten Feld. Beide Eingaben bleiben bei Rücknavigation erhalten. Live geprüft über PR #2. |
| Navigation | Rücksprung zu Szene-2-Abschluss und Menüfreischaltung nach Besuch live geprüft. Erreichter Höchststand bleibt erhalten. Menüskript mit Versionsparameter 9. |
| Prüfung | Chrome-Browserdurchlauf vor Veröffentlichung und auf Live-Webseite bestanden; je 96 Layoutprüfungen, 26 Antwortfälle, Einführungstests. Keine JavaScript-/HTTP-Fehler. |
| Grenzen | Sprachdienst simuliert; keine akustische Prüfung, physischen Geräte oder persönliche Screenshot-Sichtprüfung. |
| Nächster Bauabschnitt | Szene 4 „Der Händler“; in diesem Auftrag nicht begonnen. |

Prüfprotokoll: `SPIELAKTE_SZENE3_2026-11-17.md`.
Live-Prüfung: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/43989573354
Geprüfter Programmstand: `54c86deacae2c97724297d2e2408be790c852edd`.
Die zentrale Projektdatei außerhalb des Repositories wurde nicht verändert; dieser Repository-Nachtrag steht zur Synchronisierung bereit.

## Vorheriger Entwicklungsstand
Stand: 17.11.2026

| Bereich | Stand |
|---|---|
| Einführung und Szene 2 | Aktueller GitHub-main als Ausgangspunkt erhalten; vorhandene Dokumentation enthält Live-Prüfprotokoll. In dieser Sitzung nicht erneut im Browser geprüft. |
| Szene 3 „Die Spinnen im Wald“ | Entwicklung begonnen auf `entwicklung/szene-3-spinnen`; Texte, Antwortlogik, Buchstabenhilfe, Hörteil und Navigation vorbereitet. |
| Quelle | Aktuelle `Spinnwebenreichtum mit Spielanleitung.docx` vollständig gelesen; Abschnitt 3 maßgeblich. |
| Vergleichsbilder | Graue und blaue Variante fehlen; kein Ersatz für Originalbilder angelegt. |
| Test | 26 Antwortfälle und Hilfe-/Zustandsregeln in V8 bestanden. Browsertest, echte Geräte und Veröffentlichung offen. |
| Veröffentlichung | Keine neue Szene auf main oder GitHub Pages freigegeben. |
| Nächster Schritt | Vergleichsbilder ergänzen, Browser-/Mobilprüfung, erst danach zusammenführen und live prüfen. |

Details: `SPIELAKTE_SZENE3_2026-11-17.md`.
Dieser Nachtrag liegt im Entwicklungszweig zur späteren Zusammenführung. Die zentrale Projektdatei außerhalb des Repositories wurde nicht verändert.


## Aktualisierung nach Heikes Rückmeldung
Zwei Antwortfelder veröffentlicht, vollständiger Live-Browserlauf bestanden: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/43991015979
Code-Merge: `e9fb1e921d3800a274737f7ce6046fc61694c03e`. Details in der Spielakte Szene 3.

## Letzte Aktualisierung: Bildwahl vor Dialog
Bestätigte Ablauf- und Sprachkorrektur über PR #3 veröffentlicht. Bestehende Texte, Originalbilder und Animationen erhalten. Vollständiger Chrome-Live-Durchlauf und 120 Layoutprüfungen bestanden.
Prüfprotokoll: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44034583810
Code-Merge: `14bf5b2e6dfcaf6ad14ef60856b93bfd80a0da8d`.
