# Silvana – Szene 5: Der König

Stand: 17. November 2026. Spielakte und Nachtrag zur Masterübersicht.

## Auftrag und Quellen

Heike beauftragt die nächste Szene „Der König“ mit dem gelieferten Bild „König und die Schätze der Spinnweben(1).png“. Für die Fragen sollen einfache Kästchen mit Pergament-Hintergrund verwendet werden.

Berücksichtigt: aktueller GitHub-Stand `c47a7a085fe8c7411a181e7c4133f24d8aeee96a`, Spielakte Szene 4 und verbindlicher Bauplan vom 16.11.2026. Die vollständige Bauanleitung „Spinnwebenreichtum mit Spielanleitung.docx“ erneut gelesen (315 Textzeilen). Originalabschnitt 5, vereinfachter Lesetext und Aufgabe daraus unverändert übernommen.

Bauanleitung: https://chatgpt.com/library?file_id=libfile_19b3cd5618b48191b19a91d936061694&account_id=personal
Bild: https://chatgpt.com/library?file_id=libfile_18825ad881208191bf550f1c4383b3e4&account_id=personal

## Bestätigter Ablauf

Lesen → Wortfehler finden und ersetzen → Original 5 hören.

Lesetext:

Eines Tages kam ein König aus einem Nachbarland nach Silvana.
Er wollte einige glitzernde Spinnennetze für sein Schloss kaufen.
Er brachte viele Pferde, Soldaten und Diener mit. Die Diener trugen Kisten mit rotem Samt.

Aufgabe laut Bauanleitung: „Der König wollte Netze für zuhause stehlen.“ Das anklickbare Wort „stehlen“ verschwindet; die Lücke bleibt. Die Wörter „kaufen“, „essen“ und „vergessen“ werden angeboten. „Kaufen“ wandert nach Auswahl in die Lücke.

## Umsetzung

- Neue eigenständige Szene unter `szene-5/`: HTML, CSS, Szenensteuerung, Textdaten, Browserprüfung und Illustration.
- Geliefertes Bild als proportionale WebP-Fassung (1200 × 900 Pixel) ohne Inhaltsänderung. Das Original bleibt erhalten.
- Bild und Text nebeneinander auf breiten Bildschirmen; in schmalen Ansichten untereinander. Größenregler für Bild/Spielfeld und Schrift getrennt.
- Frage und Wortauswahl als schlichte rechteckige Pergamentkästchen. Nur die neutrale Mittelfläche des vorhandenen Pergamentbilds wird als Hintergrund genutzt; keine verzerrten dekorativen Randbereiche, keine zusätzliche Spinnweben-Dekoration auf den Fragekästchen.
- Falsche Auswahl gibt einen sanften Hinweis; die Lücke und sämtliche Auswahlmöglichkeiten bleiben erhalten. Keine Zeitmessung und keine zusätzliche freie Schreibeingabe.
- Richtige Auswahl setzt „kaufen“ ein; Auswahl verschwindet, Weiter wird freigegeben. Reduzierte Bewegung wird berücksichtigt.
- Lesetext bleibt in der Aufgabe aufklappbar. Rücknavigation innerhalb der Szene erhält Lücke bzw. Lösung. „Diese Szene wiederholen“ setzt zurück.
- Ein Hörbutton für Start, Pause, Fortsetzen und erneutes Hören; Originaltext aufklappbar. Navigation beendet die Sprachausgabe, ausgeblendete Seite pausiert sie.
- Szene-4-Abschluss bekommt Weiter zu „Der König“. Zurück aus Szene 5 führt zum Händler-Abschluss; dessen richtige Kartenreihenfolge bleibt erreichbar.
- Einführung, Szene 3 und Szene 4 ergänzen „Der König“ im Menü nach dem Besuch. Die höchste besuchte Szenennummer wird nicht herabgesetzt. Die dynamischen Menüeinträge stehen in Szenenreihenfolge.
- Bestehende Szenen, Texte, Originalbilder und Animationen bleiben erhalten. Keine bisherige Projektdatei gelöscht.

## Masterübersicht – Nachtrag

Gesamtprojekt weiterhin in Entwicklung. Szenen 1–4 veröffentlicht; Szene 5 implementiert, Prüfung und Veröffentlichung noch ausstehend. Nächster inhaltlicher Bauabschnitt: Szene 6 „Im Dorf“ gemäß Bauanleitung (Lesen → Aussagen zuordnen → Original 6 hören), noch nicht begonnen.

## Prüfstatus

JavaScript-Syntax lokal geprüft. Echte Chrome-Prüfung über den vorhandenen GitHub-Workflow vorbereitet: Lesen, Bildladen, falsches Wort, Lücke, beide falschen Alternativen, richtige Auswahl, Rücknavigation, Wiederholung, Hörsteuerung, Übergänge und Menü. Sechs Smartphone-/Tablet-Formate mit vier getrennten Schrift-/Spielfeldkombinationen auf sechs Ansichten vorgesehen. Der Sprachdienst wird in automatisierten Prüfungen simuliert. Keine physischen Endgeräte oder akustische Hörprüfung.

Abschließender Veröffentlichungs- und Prüfstand wird unten ergänzt.

## Veröffentlicht und geprüft – 17.11.2026, 17:06 Uhr

Dieser Eintrag ersetzt die zuvor offenen Prüf- und Veröffentlichungsstände.

- Prüfung vor Veröffentlichung erfolgreich: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44120951420
- Veröffentlichung über PR #11, Merge `6aabd9e1150458bcb6337ae7d77690c66991bd13`.
- GitHub-Pages-Bereitstellung erfolgreich. Anschließend vollständige Live-Prüfung bestanden: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44121376913
- Je 144 Layoutprüfungen vor Veröffentlichung und live: sechs Ansichten (Lesen, Fehlerwort, Wortauswahl, gelöst, Zuhören, Abschluss), sechs Smartphone-/Tablet-Formate im Hoch-/Querformat, vier getrennte Schrift-/Spielfeldkombinationen.
- Bild geladen und proportional; keine abgeschnittenen Schaltflächen oder horizontaler Seitenüberlauf im geprüften Umfang. Keine JavaScript- oder HTTP-Fehler im vollständigen Durchlauf.
- Geprüft: „stehlen“ antippen, Lücke bleibt, beide falschen Wörter geben Hinweise, „kaufen“ wird eingesetzt, Wortauswahl verschwindet, Weiter wird aktiviert. Zustand nach Rücknavigation, Wiederholung, Abbruch der Sprachausgabe und erneutes Hören über denselben Button geprüft.
- Übergang aus Szene 4, Rückweg zum Händler-Abschluss und dessen gelöster Kartenreihenfolge sowie Menüfreischaltung und Menü-Reihenfolge geprüft. Bestehende Tests für Einführung, Domino, Kisten/Rollen/Video, Spinnenvergleich und Händler-Bildkarten bestanden.
- Zusätzliche persönliche Live-Sichtprüfung: Königsbild, schlichte Pergamentkästchen, Lücke mit drei Wortangeboten und richtige Auswahl mit freigeschaltetem Weiter.
- Die hochgeladene WebP-Datei stimmt mit der vorbereiteten Webfassung überein (Git-Blob-Prüfsumme `1a31d2ee8acbf95fe464a39feadab25057f86ec0`). Geliefertes PNG unverändert erhalten.
- Sprachdienst im automatisierten Lauf simuliert; keine akustische Prüfung oder physischen Endgeräte. Keine Screenshotdateien als Projektquellen abgelegt.

Live-Szene: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/szene-5/

Masterstatus: Szenen 1–5 veröffentlicht und im Browser geprüft; Gesamtprojekt weiterhin in Entwicklung. Nächster inhaltlicher Bauabschnitt ist Szene 6 „Im Dorf“, noch nicht begonnen. Dieser Nachtrag ergänzt die zentrale Masterübersicht und erhält die älteren Stände als Verlauf.
