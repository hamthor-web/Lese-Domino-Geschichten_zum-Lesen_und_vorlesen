# Masterübersicht – Nachtrag Silvana / Szene 3
Stand: 17.11.2026 – Szenenmenü „Noch einmal lesen:“ veröffentlicht

| Bereich | Aktueller Stand |
|---|---|
| Einführung / Szene 2 | Vorhandene Funktionen und Originalassets erhalten. Animierter Weiter-Button führt nach dem Abspielen direkt zu Szene 3. |
| Szene 3 „Die Spinnen im Wald“ | Auf main und GitHub Pages veröffentlicht: Lesen, Original-Bildvergleich, Farbeingabe, Buchstabenhilfe, Original-Hörteil und Abschluss. |
| Bilder | Originale graue und blaue Spinnenbilder vorhanden; beide live geladen, gleiche Abmessungen 1448×1086. Kein pixelgenauer Vergleich behauptet. |
| Bildauswahl | Zuerst das nicht passende Bild wählen. Blaue Spinnen öffnen den Dialog; graue Spinnen geben einen Hinweis. Wiederholung setzt die Auswahl zurück. |
| Übergangstexte | „Szene … geschafft“ entfällt. Über Weiter-Schaltflächen zu nächsten Abschnitten steht „Jetzt geht das Abenteuer weiter.“ |
| Warum-Frage / Einzelbild | Nach Auswahl nur das blaue Bild anzeigen. Feldfrage: „Genau, dieses Bild passt nicht zur Geschichte. Warum?“ |
| Antwortpool | „Die Spinnen sind nicht grau“, „keine grauen Spinnen“, falsche/andere Farbe und sinngleiche Beschreibungen werden im ersten Feld als richtig erkannt. Zweite Farbkorrektur weiterhin getrennt. |
| Antwortfelder | Bestätigte Korrektur umgesetzt: erkannter Fehler bleibt im ersten Feld; richtige Farbe und Buchstabenhilfe in separatem zweiten Feld. Beide Eingaben bleiben bei Rücknavigation erhalten. Live geprüft über PR #2. |
| Navigation | Menü „Noch einmal lesen:“ in Einführung, Szene 2 und Szene 3. Separate Buttons „Zur Einführung“ entfernt; Rücknavigation, Wiederholung und Freischaltung besuchter Szenen erhalten. |
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

## Letzte Aktualisierung: Warum-Frage und Antwortpool
Bestätigte Änderung über PR #4 veröffentlicht. Kontextabhängige Antwortprüfung, ein verbleibendes Originalbild und genaue Frage live geprüft. Elf zusätzliche sinngleiche Fehlerbeschreibungen sowie je 120 Layoutprüfungen vor Veröffentlichung und live bestanden.
Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44040945279
Merge: `52b4295400a5112c7ba29acc0924c52009a3cb01`. Details in der Spielakte Szene 3.

## Letzte Aktualisierung: Wiederlesemenü
Bestätigte Menübeschriftung „Noch einmal lesen:“ veröffentlicht; zusätzliche Einführungsbuttons entfernt. Vollständiger Browser- und Live-Durchlauf sowie 120 Layoutprüfungen bestanden.
Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44041949854
Merge: `043c8d3c03092f41f57a09d81874f9ff41317f45`. Details in der Spielakte Szene 3.


## Letzte Aktualisierung: Hörbutton, Wetterbild-Lupe und Sonnentag-Rolle
Über PR #6 veröffentlicht. Ein Hörbutton je Hörschritt mit erneuter Wiedergabe; Wetterbilder bleiben farbig und lassen sich vollständig per Lupe ansehen. Sonnentag rollt das Pergament zusammen, schüttelt es und öffnet es erneut. Originalassets erhalten; rückwärts abgespielte Rollenframes als zusätzliche Datei ergänzt.
Vor Veröffentlichung und auf GitHub Pages je 168 Layoutprüfungen sowie vollständiger Spielablauf bestanden. Sprachdienst simuliert; keine physischen Geräte oder akustische Prüfung. Details in beiden aktuellen Spielakten.
Merge: `f6f915d60ba6d7b31e0a3873844d95aa2913bd93`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44043949323


## Letzte Aktualisierung: Vergleichsbilder bei falscher Antwort
In Szene 3 erscheint das zuvor ausgeblendete Bild erneut, wenn eine falsche Antwort oder ein Vergleichshinweis beide Bilder benötigt. Auch im zweiten Antwortfeld; Auswahl und Eingaben bleiben erhalten. Rücknavigation und Wiederholung geprüft. Vor Veröffentlichung und live vollständiger Chrome-Lauf und je 168 Layoutprüfungen bestanden; Originalassets unverändert.
Merge: `c485d20e105df5abd57847ff5e969c4e47803a6a`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44045215632


## Bedienung im Hochformat und direktes Domino-Verschieben – 17.11.2026
Zurück/Weiter stehen nebeneinander (Zurück links) oder bei notwendigem Umbruch Weiter zuerst. Obere doppelte Zurückbuttons in Einführung und Szene 2 durch die vorhandenen Rückwege unten ersetzt. Im Hochformat Dominosteine untereinander mit „Nach oben“/„Nach unten“. Direktes Ziehen mit Maus/Touch, dünner Einfügelinie und Einsetzen beim Loslassen ergänzt; Scrollen auf Spielfeld-/Vorratsbereich begrenzt. Bisherige Eingaben, Spielstände, Bilder, Texte und Animationen erhalten.
Vor Veröffentlichung und live vollständiger Browserlauf einschließlich Maus-/Touch-Eingaben sowie je 192 Layoutprüfungen bestanden. Details: [Spielakte Bedienung](SPIELAKTE_BEDIENUNG_DOMINO_2026-11-17.md).
Code-Merge: `2e7cd93a9dbbbb2d7472ec8c4603bf7f7224e16e`; abschließender Programmstand: `7c5b4ad6e71867c700ab3119dee221f5e4b38848`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44054360463


## Kleiner Tipp nach richtiger Satzprüfung ausblenden – 17.11.2026
Heikes Vorgabe: Ist der Satz richtig geordnet, wird „Kleiner Tipp“ nicht mehr gebraucht.
Umgesetzt: Nach erfolgreicher Satzprüfung ist der Tippbutton ausgeblendet. Wird die Reihenfolge danach wieder verändert, erscheint er erneut. Die bisherige freie Legung und Prüfung per Knopfdruck bleiben erhalten; vor erfolgreicher Prüfung wird keine Lösung vorweggenommen.
Vorhandene Logiktests und vollständiger Browserdurchlauf einschließlich Live-Prüfung bestanden. Sichtbarkeit vor/nach Satzprüfung und nach erneutem Verschieben geprüft. Übrige Funktionen und Originalassets erhalten.
Code: `1afe2530d0897af06532b362be5ea47fbd755f0e`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44068339781


## Satz prüfen nach richtiger Lösung ausblenden – 17.11.2026
Heike bestätigt zusätzlich: Nach erfolgreicher Satzprüfung braucht es auch „Satz prüfen“ nicht mehr.
Der Prüfschalter wird nun zusammen mit „Kleiner Tipp“ ausgeblendet, sobald die richtige Reihenfolge bestätigt ist. Nach einer Veränderung erscheinen beide wieder; die freie Legung und manuelle Prüfung bleiben erhalten.
Bestehende Logiktests und vollständiger Chrome-Browserlauf einschließlich tatsächlicher GitHub-Pages-Seite bestanden. Sichtbarkeit beider Schaltflächen vor/nach erfolgreicher Prüfung und nach erneutem Verschieben kontrolliert. Keine Originalassets oder weiteren Funktionen verändert.
Code: `d9db93d5902b6ef880df773398791066621b1477`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44069395241


## Titelbild im Hochformat an den Anfang – 17.11.2026
Heike möchte das Titelbild auf der ersten Seite im Hochformat ganz oben sehen, statt erst unter Text, Hörbutton und Weiter.
Die Einführung zeigt das unveränderte Originalbild nun im Hochformat als erstes Element ihres Inhaltsbereichs, vor Überschrift und Hörbedienung. Im Querformat bleibt das Bild neben dem Text. Beide Größenregler, Navigation, Schrift und Bildproportionen bleiben erhalten. Die CSS-Version ist erhöht, damit bestehende Browser die Änderung laden.
Vorhandener vollständiger Chrome-Spielablauf und Live-Test auf GitHub Pages bestanden. Zusätzlich 24 Titelansichten (sechs Smartphone-/Tablet-Viewports, vier getrennte Zoomkombinationen) auf Bildreihenfolge und horizontalen Überlauf geprüft; insgesamt je 216 Layoutprüfungen auf Programmstand und Live-Seite. Keine physischen Geräte geprüft.
Code: `458d573846ebdc3dae9b3e19c92f32a49ff64b84`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44100554807


## Präzisierte Titelbildposition: direkt unter dem Namenskopf – 17.11.2026
Heike präzisiert anhand ihrer Screenshots: Das Bild muss unmittelbar unter „Silvana – Geschichten zum Lesen und Vorlesen“ erscheinen. Größenbedienung, Menü, Fortschritt und Fortsetzen-Hinweis gehören darunter. Die bisherige Position nur am Anfang des Einführungskastens genügt nicht.
Umgesetzt: Das unveränderte Originalbild steht auf der ersten Einführungsseite außerhalb des Spielkastens unmittelbar nach dem Namenskopf, vor allen Bedienelementen. Das gilt in Hoch- und Querformat und bei Wiederbesuch mit gespeichertem Spielstand. Der Größenbutton ist aus dem Namenskopf unter das Bild versetzt; Einstellungen und Fortsetzen/Wiederholung bleiben erhalten. Keine doppelte Darstellung im Spielkasten. Auf den nachfolgenden Leseschritten bleibt das Titelbild ausgeblendet.
Die frühere Querformat-Anordnung neben dem Einführungstext ist durch diese neuere Vorgabe ersetzt. Bildproportionen, Texte, Originalassets und übrige Funktionen bleiben erhalten.
Prüfung: vollständiger Chrome-Spielablauf und tatsächliche GitHub-Pages-Seite bestanden. 24 Titelansichten prüfen direkt folgende Position nach dem Namenskopf und alle Bedienelemente darunter; zusätzlich Wiederbesuch mit gespeichertem Stand geprüft. Insgesamt je 216 Layoutprüfungen einschließlich vorhandener Domino-/Wetter-/Spinnenprüfungen. Keine physischen Endgeräte oder akustische Hörprüfung.
Code: `1a00437c26fedd7d8a792d70b700d9bd84952e2f`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44104586483
