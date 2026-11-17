# Silvana – Spielakte Szene 3: Die Spinnen im Wald
Stand: 17.11.2026 – Szenenmenü „Noch einmal lesen:“ ohne zusätzliche Einführungsbuttons

## Veröffentlichung und bestandene Live-Prüfung – 17.11.2026, 01:43 Uhr
Dieser neuere Eintrag ersetzt die früheren offenen Bild-/Browser-/Veröffentlichungshinweise; die historischen Entwicklungsnotizen bleiben unten erhalten.

- Heikes Originalbilder liegen unverändert unter `assets/spinnen-grau.png` und `assets/spinnen-blau.png`.
- Beide Bilder wurden im echten Chrome-Browser auf dem geprüften Programmstand und auf der tatsächlichen GitHub-Pages-Webseite geladen; jeweils 1448×1086 Pixel. Die gezeigten Bilder wurden visuell der grauen bzw. blauen Spinnenvariante zugeordnet. Eine pixelgenaue Gleichheit außerhalb der Spinnen wurde nicht nachgewiesen.
- Der animierte Weiter-Button von Szene 2 führt nach Ende des Original-MP4s auf Klick direkt zu `../szene-3/`. Das Originalvideo spielt weiterhin einmalig; der bisherige Szenenabschluss bleibt für Rücknavigation und Wiederholung erreichbar.
- Die neue Szene und alle Verbindungen wurden über PR #1 auf main veröffentlicht. Kein Entwicklungszweig oder Originalasset gelöscht.
- Die Einführung lädt das geänderte Menüskript mit neuem Versionsparameter `game.js?v=9`. Dadurch bekommen Browser mit vorheriger Skriptversion die neue Menülogik.
- Echter Chrome-Durchlauf: beide falschen Kisten → Marktplatz → zwei Rollen mit gleicher GIF-Quelle → falsches/richtiges Wetter → vollständiges Original-MP4 → Weiter → Szene 3 → beide Bilder → Teilantworten → drei Fehlversuche → vier Buchstabenfelder mit genau einem vorgegebenen Buchstaben → richtige Lösung → Hörschritt → Abschluss → Zurück bis Szene-2-Abschluss → erneuter Besuch → Szenenmenü in der Einführung.
- Jeweils 96 Layoutprüfungen auf Programmstand und Live-Webseite: sechs Viewports (360×800, 800×360, 412×915, 915×412, 768×1024, 1024×768), vier Zoomkombinationen (100/100, 160/100, 100/160, 160/160), vier Spielansichten. Kein horizontaler Seitenüberlauf.
- 26 Antwortfälle und vorhandene Einführungstests auch in Node bestanden. Im vollständigen Live-Durchlauf keine JavaScript- oder HTTP-Fehler.
- Der Sprachdienst ist im automatisierten Browserlauf simuliert (Start/Pause/Fortsetzen/Neustart). Keine akustische Hörprüfung, keine physischen Endgeräte und keine persönliche Screenshot-Sichtprüfung in dieser Sitzung.
- Die lokale Arbeitsumgebung dieser Chatsitzung bleibt nicht verfügbar. Die echte Browserprüfung lief erfolgreich über den neu ergänzten GitHub-Actions-Workflow.

Spielseite: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/
Szene 3: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/szene-3/
Bestandener Prüf- und Live-Lauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/43989573354
Veröffentlichungsmerge: `e93c2adae4293ec9b5ca062ad7f3dc05363ce74c`.
Abschließend geprüfter Programmstand (Menüversion / wartender Live-Test): `54c86deacae2c97724297d2e2408be790c852edd`.

Nächster inhaltlicher Bauabschnitt: Szene 4 „Der Händler“, entsprechend bestätigter Bauanleitung. Mit diesem Fehlerbehebungsauftrag nicht begonnen.

## Historisches Entwicklungsprotokoll

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


## Bestätigte Korrektur: zwei Antwortfelder – 17.11.2026
Heike beanstandet, dass das Kind seine erkannte Fehlerantwort „blau“ löschen muss, um im selben Feld „grau“ einzugeben. Bestätigte Vorgabe: Ein zweites Eingabefeld für die richtige Antwort einblenden.

Umsetzung:
- Erstes Feld bleibt für „Schreibe auf, was falsch ist.“
- Nach erkannter blauer Spinnenfarbe bleibt die eingegebene Antwort unverändert und lesbar im ersten Feld stehen.
- Darunter erscheint ein eigenes leeres Feld „Welche Farbe haben die Spinnen im Text?“ mit separater Prüfschaltfläche.
- Die richtige Farbe „grau“ wird im zweiten Feld geprüft. Drei sachlich falsche Farbkorrekturen (auch erneutes „blau“) zählen zur Buchstabenhilfe.
- Die Hilfe steht unter dem zweiten Feld; beide Eingaben bleiben bei Rücknavigation erhalten. Eine Szenenwiederholung setzt beide zurück.
- Wird schon im ersten Feld eindeutig „grau“ genannt, bleibt die bisherige Annahme dieser passenden Antwort erhalten.
- Texte, Originalbilder, Sprachablauf und vorangehende Animationen bleiben erhalten.
- Versionierte Skript-/CSS-Aufrufe verhindern das Mischen alter und neuer Dateien.
Prüfung und Veröffentlichung dieses Nachtrags erfolgreich abgeschlossen; Details folgen im Prüfprotokoll.


### Prüfung und Veröffentlichung der zwei Felder
Veröffentlicht über PR #2 / Merge `e9fb1e921d3800a274737f7ce6046fc61694c03e`.
Vor Zusammenführung echter Chrome-Browserlauf bestanden. Nach Veröffentlichung auch der vollständige Live-Durchlauf auf GitHub Pages erfolgreich:
- Erste Eingabe mit „blau“ bleibt unverändert und lesbar im ersten Feld stehen; zweites Feld ist zunächst leer und erhält den Fokus.
- Direkte Korrektur „GRAU“ im zweiten Feld ohne Hilfe erfolgreich.
- Nach drei falschen Farbkorrekturen im zweiten Feld (einschließlich „blau“) erscheint die Hilfe mit vier Feldern und einem vorgegebenen Buchstaben; das Lösungswort wird in die zweite Eingabe übernommen.
- Erste und zweite Antwort bleiben beim Zurückgehen erhalten.
- Je 96 Layoutprüfungen vor Veröffentlichung und auf der Live-Seite, sechs Smartphone-/Tablet-Viewports und vier getrennte Schrift-/Spielfeldwerte. Kein horizontaler Überlauf und keine JavaScript-/HTTP-Fehler.
- Vorhandene 26 Antwortfälle, zusätzliche Korrekturschritt-Tests und Einführungstests bestehen.
- Zusätzlich persönlich im Live-Browser die Darstellung mit erhaltener erster Eingabe und neuem leeren zweiten Feld angesehen. Keine Screenshots als Datei in die Projektquellen übernommen.
- Sprachdienst weiterhin simuliert; keine physischen Endgeräte oder akustische Prüfung.
Bestandener Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/43991015979


## Bestätigte Ablauf- und Sprachkorrektur – 17.11.2026
Heike bestätigt: Zuerst „Schau genau: Welches Bild passt nicht zur Geschichte?“ anzeigen. Das Kind wählt das Bild mit den blauen Spinnen. Erst danach folgt der vorhandene Dialog mit den zwei getrennten Antwortfeldern.

Umgesetzt im Entwicklungszweig:
- Beide Originalbilder sind große, per Touch/Maus/Tastatur bedienbare Bildschaltflächen.
- Die Wahl des passenden Bilds mit grauen Spinnen gibt einen sanften Hinweis und schaltet den Dialog nicht frei.
- Nach Wahl der blauen Spinnen erscheint der unveränderte Frage-/Antwortablauf. Erste Fehlerantwort und zweite Farbkorrektur bleiben getrennt.
- Zurücknavigation erhält die Bildwahl und beide Antworten; Wiederholung setzt die Auswahl zurück.
- „Szene … geschafft“ entfällt in Szene 2 und 3, ebenso die entsprechende Einführungsformulierung. Die beschreibende Rückmeldung über das Erlebte bleibt erhalten.
- Über vorhandenen Weiter-Schaltflächen zum nächsten Abschnitt steht „Jetzt geht das Abenteuer weiter.“ – einschließlich des animierten Weiter-Buttons nach der Wetterwahl.
- Szene 4 wurde nicht angelegt und kein Weiter-Button zu einem noch nicht vorhandenen Ziel erfunden.
- Originalbilder, Originaltexte, getrennte Zoomregler und vorhandene Kisten-/Rollen-/Weiteranimationen bleiben erhalten.
Browserprüfung und Veröffentlichung erfolgreich abgeschlossen; siehe nachstehendes Prüfprotokoll.


### Veröffentlichung und Prüfung der Bildauswahl
Über PR #3 mit Merge `14bf5b2e6dfcaf6ad14ef60856b93bfd80a0da8d` auf main veröffentlicht.
- Vollständiger Chrome-Durchlauf vor Veröffentlichung und auf der echten GitHub-Pages-Webseite bestanden.
- Nach Lesetext erscheinen zuerst nur Bildfrage und beide anklickbaren Bilder. Graue Spinnen geben einen Hinweis, ohne Fragen freizuschalten. Erst blaue Spinnen öffnen den vorhandenen Dialog.
- Beide Antwortfelder, direkte Farbkorrektur, Hilfe nach drei Fehlversuchen, Rücknavigation und Menüfreischaltung weiterhin geprüft. Eine Wiederholung verlangt erneut die Bildauswahl.
- „Szene … geschafft“ in den aktuellen Abschlüssen entfernt. Beschreibende Rückmeldungen bleiben stehen. Abenteuertext über vorhandenen Weiter-Schaltflächen zu nächsten Abschnitten geprüft, einschließlich Original-MP4.
- Je 120 Layoutprüfungen vor Veröffentlichung und live, sechs Smartphone-/Tablet-Viewports und vier Zoomkombinationen. Auch die anfängliche Bildwahl ohne Dialog ist enthalten.
- Keine JavaScript- oder HTTP-Fehler. Bestehende Antwort-/Hilferegeln und Einführungstests bestehen.
- Zusätzlich die tatsächliche Bildwahl im Cloud-Browser persönlich angesehen: zwei große Bildflächen, zuerst keine Antwortfelder; Hinweis nach grauer Auswahl, Dialog nach blauer Auswahl. Keine Screenshots in Projektquellen gespeichert.
- Keine physischen Endgeräte oder akustische Hörprüfung; automatisierter Sprachdienst weiterhin simuliert.
Bestandener Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44034583810
Aktuelle Szene: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/szene-3/?stand=bildwahl


## Bestätigte Korrektur: Warum-Frage und Antwortpool – 17.11.2026
Heike: Nach Wahl des unpassenden Bilds soll der Dialog „Genau, dieses Bild passt nicht zur Geschichte. Warum?“ lauten. Das andere Bild darf verschwinden. „Die Spinnen sind nicht grau“ muss als richtige Antwort anerkannt werden; Antwortpool entsprechend erweitern.

Umsetzung:
- Nach korrekter Bildwahl wird das andere Originalbild ausgeblendet; das gewählte Bild bleibt proportional sichtbar. Wiederholung zeigt beide Bilder erneut.
- Der bisherige Hinweis und „Schreibe auf, was falsch ist“ sind durch die bestätigte Warum-Frage als Feldbeschriftung ersetzt.
- „nicht grau“, „keine grauen Spinnen“, „falsche/andere Farbe“, „die Farbe stimmt nicht“ und sinngleiche Varianten werden als richtige Fehlerbeschreibung anerkannt, ohne Fehlversuch.
- Anschließend bleibt die bestätigte zweite Eingabe für die richtige Farbe erhalten. Fehlerbeschreibung und Farbkorrektur werden getrennt bewertet: „nicht grau“ ist eine zutreffende Beschreibung des Bildfehlers, aber keine richtige Antwort auf die Frage nach der Textfarbe. Dort löst „grau“ weiterhin die Aufgabe.
- Erste Eingabe, Auswahl und zweite Eingabe bleiben bei Rücknavigation erhalten; bestehende Hilfe, Originaltexte, Bilder und Animationen bleiben erhalten.
Browser- und Live-Prüfung dieses Nachtrags erfolgreich abgeschlossen; siehe Prüfprotokoll.


### Veröffentlichung und bestandene Prüfung des Warum-Dialogs
Veröffentlicht über PR #4 mit Merge `52b4295400a5112c7ba29acc0924c52009a3cb01`.
- Exakter Fragetext, nur noch gewähltes Bild und „Die Spinnen sind nicht grau.“ im echten Chrome-Browser vor Veröffentlichung und auf GitHub Pages erfolgreich geprüft.
- Elf zusätzliche sinngleiche Fehlerbeschreibungen einschließlich Kontexttrennung getestet. Auch „blau statt grau“ und die umgekehrte Farbkorrektur „grau statt blau“ werden unterschieden.
- Die zweite Eingabe bleibt getrennt; „nicht grau“ löst dort die Farbfrage nicht irrtümlich.
- Bestehender Ablauf, zwei Antwortfelder, Hilfe, Rücknavigation, Wiederholung und Szenenübergänge weiterhin bestanden.
- Je 120 Layoutprüfungen auf Programmstand und Live-Webseite: sechs Smartphone-/Tablet-Viewports, vier Schrift-/Spielfeldkombinationen; keine JavaScript- oder HTTP-Fehler.
- Zusätzlich persönliche Live-Sichtprüfung: Nur das ausgewählte blaue Bild ist sichtbar; die vollständige Warum-Frage erscheint am ersten Feld. Die Eingabe „Die Spinnen sind nicht grau.“ wird bestätigt und bleibt erhalten, das zweite Feld erscheint leer.
- Keine Originalassets ersetzt oder entfernt; keine physischen Endgeräte oder akustische Hörprüfung, automatisierter Sprachdienst simuliert.
Bestandener Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44040945279
Spielseite: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/szene-3/?stand=warum


## Bestätigte Navigation: Wiederlesemenü statt Einführungsbutton – 17.11.2026
Heike bestätigt:
- Den eigenständigen Button „Zur Einführung“ in allen aktuellen Szenen entfernen.
- Das bisherige Szenenmenü „Zurück zu vorherigen Szenen“ mit „Noch einmal lesen:“ beschriften.

Umsetzung:
- Menübeschriftung in Einführung, Szene 2 und Szene 3 geändert.
- Einführungsbutton und zugehörige Klickhandler in den Abschlüssen von Szene 2 und 3 entfernt. In der Einführung gab es keinen entsprechenden eigenständigen Button.
- Bestehende Rücknavigation, Wiederholung und Menüfreischaltung bleiben erhalten; Menülinks führen weiterhin nur zu den bereits erreichten Abschnitten.
- Original-Brandlink und alle Originalbilder, Texte und Animationen unverändert.
Prüfung und Veröffentlichung erfolgreich abgeschlossen; siehe nachstehendes Protokoll.


### Veröffentlichung und Prüfung des Wiederlesemenüs
Veröffentlicht über PR #5 / Merge `043c8d3c03092f41f57a09d81874f9ff41317f45`.
- Neue Beschriftung „Noch einmal lesen:“ in allen drei aktuellen Abschnitten aus GitHub zurückgelesen und bestätigt.
- „Zur Einführung“ und die entsprechenden Klickhandler in Szene 2 und 3 entfernt. Die übrige Navigation funktioniert weiterhin.
- Bestehende Logiktests, vollständiger Chrome-Browserdurchlauf vor Veröffentlichung und auf der echten GitHub-Pages-Webseite bestanden.
- Szenenabschlüsse, Rücknavigation zum Abschluss von Szene 2, erneuter Besuch und Menüfreischaltung ohne JavaScript-Fehler geprüft.
- Je 120 Layoutprüfungen auf Programmstand und Live-Seite über sechs Smartphone-/Tablet-Viewports und vier Schrift-/Spielfeldkombinationen bestanden.
- Originalbilder, Texte und Animationen unverändert. Keine physischen Endgeräte oder akustische Hörprüfung.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44041949854
