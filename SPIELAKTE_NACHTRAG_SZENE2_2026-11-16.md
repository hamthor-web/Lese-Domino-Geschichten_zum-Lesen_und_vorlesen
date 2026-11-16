# Silvana – Spielakten-Nachtrag: Szene 2 „Vorstellung“
Datum: 16.11.2026

## Grundlage
Verbindliche Datei: „Spinnwebenreichtum mit Spielanleitung.docx“, Abschnitt 2 „Vorstellung“.

## Umgesetzt und auf GitHub
- Neue eigenständige Szene unter `szene-2/index.html`.
- Ablauf: Originaltext anhören (Browser-Sprachausgabe mit Pause) → vereinfachten Text lesen → eine der beschrifteten Kisten „Marktplatz“, „Stoff“, „Wege“ wählen → zwei Stadtbilder (Sonnenschein/Regen) vergleichen → passende Regenabbildung wählen → Abschluss.
- Bei falscher Kiste oder falschem Bild erscheint ein sanfter textbezogener Hinweis ohne Verraten der Lösung.
- Originaltext und vereinfachter Text aus der genannten Spielanleitung übernommen.
- Originale Styling-Datei und somit Original-Pergament-/Spinnweben-Buttons aus `vorschau-einfuehrung/styles.css` werden wiederverwendet; Schrift- und Spielfeldgrößen separat regelbar.
- Die bestehende Einführung bleibt erhalten und hat im Abschluss einen neuen Button „Weiter zu Szene 2“.

## Prüfstatus und offene Punkte
- Änderungen auf GitHub durch erneutes Abrufen der Dateien bestätigt.
- Kein abschließender praktischer Test der Benutzeroberfläche auf Smartphone/Tablet oder des Vorlesens durchgeführt.
- Zwei Stadtillustrationen sind derzeit eigenständige SVG-Zeichnungen innerhalb der Seite und müssen visuell abgenommen werden; sie sind keine vom Benutzer freigegebenen Originalbilder.
- Bei sehr großen Schriften und kleinen Smartphone-Querformaten noch Layoutprüfung durchführen.
- Szene 3 „Die Spinnen im Wald“ folgt später; derzeit keine automatische Weiterschaltung.
- Die zentrale Masterübersicht/Spielakte im ChatGPT-Projekt ist noch zu aktualisieren. Keine vorhandenen Verwaltungsdateien überschrieben.

## Veröffentlicht
`main`: `szene-2/index.html`, `vorschau-einfuehrung/game.js`, `vorschau-einfuehrung/index.html`.


## Navigationsentscheidung vom 16.11.2026 (bestätigt)
- Jede Unterseite in Szene 1 und Szene 2 besitzt eine Zurück-Schaltfläche zur unmittelbar vorherigen Seite. Zu Beginn von Szene 2 führt Zurück zum Abschluss der Szene 1; bei Szene 1 gibt es vor dem Einstieg keine vorherige Spielseite.
- Die untere Schaltfläche zur nächsten Aufgabe wird neutral mit „Weiter“ beschriftet. Die anschließende Aufgabe soll eine Überraschung bleiben.
- Ein Szenenmenü bietet „Szene 1“ und „Szene 2“ an, aber nur wenn das Kind die jeweilige Szene tatsächlich schon erreicht hat. Freischaltung bleibt im Browser lokal gespeichert. Szene 1 ist von Anfang an zugänglich.
- Vorwegnahme der Kistenaufgabe im Abschluss der Einführung entfernt; ebenso der direkte Wetterhinweis auf der Bildauswahl.
- Die vorhandenen Originalbuttons bleiben über die gemeinsame CSS-Datei eingebunden.
- Die HTML- und JavaScript-Dateien wurden nach dem Upload erneut aus GitHub gelesen und die JavaScript-Syntax geprüft. Ein echter Browser-/Gerätetest ist noch offen.
- Die zentrale Masterübersicht im Projekt wurde nicht verändert; bei der nächsten Synchronisierung den Navigationseinbau nachtragen.


## Menüdarstellung – bestätigte Entscheidung 16.11.2026
- Die vorherige großflächige Reihe von Szenenbuttons wurde durch **einen kompakten Aufklappbutton „Menü“** ersetzt. Das Menü überlagert beim Öffnen die Seite, statt dauerhaft Platz einzunehmen.
- Die Menülinks benutzen die **tatsächlichen Abschnittsüberschriften**: „Die Geschichte beginnt“ und „Die vier Straßen“, keine Nummern als Beschriftung.
- In der Einführung wird „Die vier Straßen“ nur angezeigt, wenn der zweite Abschnitt zuvor erreicht wurde (lokale Freischaltung). Auf der bereits erreichten zweiten Szene sind beide Einträge sichtbar. Das Menü führt jeweils an den Anfang des ausgewählten Abschnitts.
- Der eigenständige Zurück-Button bleibt und führt weiterhin zur jeweils vorherigen Unterseite.
- Originalbuttons für das eigentliche Spiel bleiben unverändert. Die Menüsteuerung ist bewusst kompakter gestaltet und erfüllt weiterhin Mindesthöhe und Lesbarkeit.
- GitHub-Dateien nach Änderung erneut gelesen; JavaScript-Syntax geprüft. Sichtprüfung auf realen Geräten weiterhin offen.


## Original-Kistenbilder und Öffnungsanimationen – 16.11.2026
- **Bestätigte Menübeschriftung:** Statt „Menü“ heißt der kleine Aufklappbutton nun „Zurück zu vorherigen Szenen“. Die Titel verlinken nur bereits besuchte Szenen.
- **Bestätigte Kistenmechanik:** Das Kind sieht zuerst drei anklickbare geschlossene Kistenvorschauen. Erst auf Klick spielt die passende Animation. Marktplatz ist richtig und führt anschließend zur Wetter-Bildaufgabe; Stoff und Wege sind falsch, nach der Animation folgt ein sanfter Hinweis und die Kistenwahl wird wieder möglich.
- **Exakte vom Benutzer bereitgestellte Dateien** (GIF und PNG) nach Ansicht zugeordnet:
  - `assets/kiste-marktplatz.png` → `assets/kiste-marktplatz-oeffnet.gif` (mit Würstchen)
  - `assets/kiste-stoff.png` → `assets/kiste-stoff-animation.gif`
  - `assets/kiste-wege.png` → `assets/kiste-wege-animation.gif`
- **GitHub-Stand:** Aufrufpfade und Logik in `szene-2/index.html` implementiert und hochgeladen. Beide Menüs umbenannt.
- **Noch nicht auf GitHub:** die sechs Binärdateien. Als `Silvana_Szene2_Originalkisten_GitHub_Upload.zip` für den manuellen Upload in den Ordner `/assets` bereitgestellt. Solange diese Dateien fehlen, bleibt der bisherige Textkisten-Fallback sichtbar; die neuen Originalanimationen können noch nicht abgespielt werden.
- Kein live Browser-/Mobiltest des endgültigen GIF-Ablaufs. Die vorhandenen Spieltexte und Original-Buttonstile wurden nicht geändert.
- Die zentrale Projekt-Masterübersicht muss bei der nächsten Synchronisierung um diesen Entwicklungsstand ergänzt werden.


## Korrektur: zwei Pergamentrollen, 17.11.2026
- Die zuvor angenommene **eine** Rolle war falsch. Die Nutzerin hat ausdrücklich **zwei identische, jeweils einmal öffnende Rollen** über den beiden falschen Kisten (Stoff und Wege) bestätigt.
- Nach richtiger Marktplatz-Kiste folgt die Ansicht mit zwei Rollen. In jeder Rolle erscheint jeweils eines der beiden Stadtbilder: Sonnenschein bzw. Regen. Zwischen den Rollen steht die kindgerechte Frage „Von welchem Wetter war in der Geschichte die Rede?“
- Die korrigierte Darstellung und Interaktionslogik wurden in `szene-2/index.html` auf GitHub aktualisiert. Der Bildinhalt wird nach 1,44 s freigegeben, die GIF-Datei `rolle-oeffnet.gif` muss selbst ebenfalls auf einmaliges Abspielen eingestellt sein.
- **Noch nicht erledigt:** Upload der drei neuen Binärdateien (`rolle-oeffnet.gif`, `marktplatz-sonne.png`, `marktplatz-regen.png`) und gegebenenfalls der sechs ursprünglichen Kistenassets. Das Repository kann hier über die verfügbare GitHub-Verbindung nur für Textdateien sicher bearbeitet werden; Grafikdateien nicht auf GitHub übertragen. Daher noch kein visueller Live-Test möglich.
- Originalillustrationen bleiben unverändert, es wird keine neue Rolle generiert.


## Abschluss und Browserprüfung – 17.11.2026

Dieser Eintrag aktualisiert die historischen offenen Uploadhinweise oben.

- Übergabe `ARBEITSAUFTRAG.md` vollständig gelesen. Aktueller main-Stand vor Beginn: `fce8faa0b51b8a9f7360dd3c6a4b02a400a60126`.
- `kiste-stoff-animation.gif` war inzwischen bereits vorhanden und bytegleich zur Übergabe. Nicht erneut überschrieben. Neu ergänzt werden ausschließlich `rolle-oeffnet.gif`, `marktplatz-sonne.png` und `marktplatz-regen.png`, unverändert aus der Übergabe. Alle übrigen vorhandenen Originalassets bleiben erhalten.
- Nach Marktplatz-Animation öffnen zwei Exemplare desselben Original-Rollen-GIFs gemeinsam über den Originalkisten Stoff und Wege. Erst nach 1,44 Sekunden erscheinen die beiden unverzerrten Wetterbilder. Das einmalige GIF bleibt auf seinem offenen Endbild stehen.
- Laden/Decodieren vor Animationsstart verhindert, dass langsames Laden die Öffnungszeit verkürzt. Kistenanimationen warten auf das Ladeereignis. Alte Übergänge werden bei Zurück/Weiter abgebrochen; verspätete Timer können keine andere Unterseite mehr verändern.
- Spielfeldzoom wirkt auf Bildbereich und Abstände; Schriftzoom bleibt unabhängig. Auf schmalen Bildschirmen stehen Rollen und Frage untereinander, die Frage zwischen beiden Bildangeboten. Original-Spinnwebenbuttons und Schrift bleiben erhalten.
- Falsche Auswahl bleibt freundlich und verrät die Wetterlösung nicht. Abschluss erst nach Regenauswahl. Erneute Kistenwahl setzt die Bildaufgabe zurück.
- Sprachausgabe: Pause/Fortsetzen und Neustart erhalten; Fehler beim Start werden verständlich gemeldet. Veraltete Sprachereignisse nach Navigation werden ignoriert.

### Prüfung vor Veröffentlichung

- Dateilesen/-schreiben und echter Headless-Chromium-Klicktest erfolgreich.
- Browserdurchlauf: beide falschen Kisten, richtige Kiste, zwei Rollen, falsches Wetter, richtiges Wetter, Abschluss, Rücknavigation während laufender Animation und bei offenem Rollenbild.
- Genau zwei Rollen mit identischer GIF-URL; nach Öffnen und weiteren 1,8 Sekunden unverändertes Endbild im Browser nachgewiesen. GIF-Metadaten: 8 Frames, 1,44 Sekunden, kein Loopblock; Stoff: 8 Frames, 0,96 Sekunden, kein Loopblock.
- 150 Layoutprüfungen: fünf Spielschritte × sechs Viewports (360×800, 800×360, 412×915, 915×412, 768×1024, 1024×768) × fünf Schrift/Spielfeld-Kombinationen (100/100, 160/100, 100/160, 160/160, 90/80). Kein horizontaler Seitenüberlauf; Wetterbildflächen mindestens 100×75 CSS-Pixel. Desktop und sechs maximale Zoomansichten als Screenshots kontrolliert.
- Unabhängigkeit beider Regler anhand berechneter Bildbereichsbreite, Abstände und Schriftgröße geprüft. Browserkonsole ohne JavaScript-Fehler.
- Vorhandene Einführungstests `node tests/logic.cjs` bestehen unverändert.
- Sprachausgabe-Pause, Fortsetzen, Fehlerfall und verspätete Ereignisse mit simuliertem Sprachdienst geprüft. Keine akustische Bestätigung; keine physischen Android-/iPad-Geräte getestet.
- Die in der Übergabe genannte Word-Anleitung ist weder in der bereitgestellten Projektbibliothek noch über die Suche verfügbar. Keine neuen literarischen Texte übernommen oder vorhandenen Erzähl-/Lesetexte umgeschrieben.

### Veröffentlichung und Live-Prüfung

Veröffentlicht auf `main` mit Commit [`91ca6f135ba34d1406ff93de58454f32eec0772c`](https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/commit/91ca6f135ba34d1406ff93de58454f32eec0772c).

- GitHub-Rücklesen: alle sieben geänderten/neuen Dateien stimmen bytegenau mit dem geprüften Stand überein. Die übrigen Kistenassets und die Einführung blieben unverändert.
- GitHub Pages liefert den neuen Spielcode sowie alle vier Übergabe-Assets erfolgreich und byteidentisch aus; die bereits vorhandene Stoffanimation wurde nur verifiziert.
- Tatsächliche Live-Browserseiten durchgespielt: Root-Weiterleitung → Einführung lesen → Domino korrekt legen und prüfen → Weiter zu Szene 2 → beide falschen Kisten → Marktplatz → beide Rollen → falsches/richtiges Wetter → Abschluss → Rücknavigation bis Einführung. Szenenmenü wird nach Besuch korrekt freigeschaltet. Tippbedienung im mobilen Chromium-Kontext mit Touch aktiviert.
- Live-GIF-Nachweis: Bild zwischen 0,2 und 0,6 Sekunden sichtbar verändert; offenes Endbild nach Ende und weiteren 1,6 Sekunden identisch. Genau zwei Rollen vorhanden.
- Zusätzlich sechs Live-Viewports in Hoch-/Querformat bei Schrift/Spielfeld 160/160 geprüft: kein horizontaler Überlauf.
- Keine JavaScript-Seitenfehler oder HTTP-Fehler im vollständigen Live-Durchlauf.
- Einschränkung der Testumgebung: Der separate Chromium-Download vertraut dem Umgebungszertifikat nicht (`ERR_CERT_AUTHORITY_INVALID`). Der Live-Test wurde daher mit `ignore_https_errors=True` ausgeführt. Der HTTP-Client konnte dieselben HTTPS-URLs regulär laden. Das ist kein Nachweis eines Zertifikatfehlers der Website.
- Keine akustische Hörprüfung oder Prüfung auf physischen Endgeräten. Word-Originalquelle weiterhin nicht verfügbar; bestehende literarische Texte bleiben erhalten.

