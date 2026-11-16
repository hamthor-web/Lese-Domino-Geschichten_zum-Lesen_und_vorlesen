# Lese-Domino – Spielaktennachtrag und Stand der Einführung

Stand: 16. November 2026, 19:27 Uhr (Europe/Berlin).

## Bestätigter Auftrag

Heike hat nach Festlegung der Bauanleitung und Reihenfolge den Bau der Einführung freigegeben: „ok, leg los“. Der erste Bauabschnitt umfasst Originalvorlesen, vereinfachten Lesetext, erstes Domino und grundlegende responsive Bedienung. Kistenaufgabe, Spinnenvergleich und weitere Abschnitte folgen später.

Verbindliche Quelle: Spinnwebenreichtum mit Spielanleitung.docx, bestätigt im vorangehenden Gespräch. Die Texte dieses ersten Abschnitts wurden aus der Datei übernommen, nicht neu formuliert. Maßgebliche Ablaufentscheidungen: BAUPLAN_ENTSCHEIDUNGEN_2026-11-16.md.

## Neuer technischer Stand

Eine eigenständige spielbare Einführung ist fertiggestellt und privat veröffentlicht:
https://silvana-einfuehrung.stable-globe-1574.chatgpt.site

Die private Vorschau erfordert Anmeldung mit dem berechtigten ChatGPT-Konto. Eine zweite Sichtprüfung hinter der Anmeldung im Cloud-Browser war nicht möglich. Die Bereitstellung wurde vom Veröffentlichungsdienst als erfolgreich bestätigt; die lokalen, identischen Dateien wurden im Browser geprüft.

Quellcode in diesem Repository: vorschau-einfuehrung/index.html, styles.css, game.js und content.json. Zum lokalen Ausführen den Ordner über einen HTTP-Server bereitstellen; wegen des Ladens von content.json ist direktes Öffnen als file-URL nicht vorgesehen.

Die bisherigen Dateien und der alte Prototyp wurden weder ersetzt noch gelöscht. Die neue Einführung ist ein gesonderter Entwicklungsstand. Keine Android-APK, kein AAB und keine Erweiterung auf 14 spielbare Abschnitte in diesem Schritt.

## Umgesetztes Verhalten

- Originalanfang auf Knopfdruck über die deutsche automatische Browser-Vorlesefunktion; Pause, Weiterhören, Neustart und aufklappbarer Originaltext.
- Wechsel zum vereinfachten Lesetext; anschließend Domino mit „Das kleine Land“, „hatte zwei Dörfer“, „und hieß Silvana“.
- Steine frei anfügen, auswählen, nach links/rechts verschieben und zurücklegen. Drag-and-drop ergänzend im Code vorhanden.
- Bewertung erst mit „Satz prüfen“. Falsche Reihenfolgen bleiben unverändert liegen. Fehlende Steine werden angesprochen, ein Tipp ist verfügbar. Abschluss erst nach richtiger Prüfung.
- Satzanfang und Schlusspunkt automatisch dargestellt. Wörter innerhalb eines Steins werden nicht umgestellt.
- Getrennte Größenregelung: Schrift 90–160 %, Spielfeld 80–160 %. Spielfeldregler ändert Abstände und Steingröße ohne Änderung der Schriftgröße.
- Speicherung von Abschnitt, gelegten Steinen und Größenwerten im Browser; Fortsetzen nach Neuladen wird angeboten.
- Unterbrechen der Browser-Vorlesefunktion beim Verlassen des Abschnitts; beim Ausblenden des Tabs wird pausiert.
- Creme, Waldgrün und Gold; eigenständige einfache SVG-Einstiegsillustration. Keine neue Würstchen-Animation erstellt, vorhandene Videos nicht verändert.

## Durchgeführte Prüfungen

- JavaScript-Syntaxprüfung bestanden.
- Logikprüfung aller sechs Anordnungen der drei Steine: ausschließlich 0–1–2 ist richtig; falsche Anordnungen werden nicht automatisch umgeschrieben.
- Unvollständiger Satz, Umstellen, Zurücklegen, ungültige Stein-ID, Rücksetzen der richtigen Bewertung nach Änderung geprüft.
- Vorlesetext, Pause/Fortsetzen und veraltete Audio-Endereignisse nach Abbruch mit simuliertem Sprachdienst geprüft. Das ist kein akustischer Nachweis.
- Browserdurchlauf: Anhören versucht, Leseseite geöffnet, falschen Satz gelegt und geprüft, selbst korrigiert, richtig geprüft, Abschluss geöffnet, neu geladen und fortgesetzt.
- Sechs simulierte Viewports: 360×800, 800×360, 412×915, 915×412, 768×1024, 1024×768.
- Auf der Dominoseite je Viewport vier Größenkombinationen geprüft: 100/100, 160/100, 100/160 und 160/160 Prozent (Schrift/Spielfeld). In diesen 24 Kombinationen kein horizontaler Seitenüberlauf gemessen. Hör- und Leseseite ebenfalls in Hoch-/Querformat geprüft; ausgewählte Ansichten visuell kontrolliert. Nicht jede Kombination wurde als Screenshot beurteilt.
- Unabhängigkeit der Regler anhand berechneter Steinschrift und Innenabstände bestätigt: Spielfeldverkleinerung änderte Padding, nicht Font; Schriftverkleinerung änderte Font, nicht Padding.
- Kleine Smartphoneansicht bei maximaler Vergrößerung: Bedienelemente durch vertikales Scrollen erreichbar und Abschluss per Antippen lösbar.

## Grenzen und nächste Schritte

Die automatische Stimme konnte in der Cloud-Testumgebung nicht starten; der verständliche Fehlerhinweis und aufklappbare Originaltext funktionierten. Hörqualität, echte Tonausgabe, Pause/Fortsetzen auf Android/iPad und Verhalten beim realen Gerätewechsel bleiben zu prüfen. Die automatisierte Audioprüfung verwendet eine Simulation. Drag-and-drop wurde nicht in einem realen Touch-Gerätetest verifiziert; die vollständige alternative Tippbedienung wurde im Browser durchgespielt.

Die Einführung bitte zuerst auf Heikes Handy/Tablet beurteilen. Danach Kistenaufgabe und Spinnenvergleich mit bestätigter Schreibhilfe nach dem dritten Fehlversuch ergänzen. Die restlichen Abschnitte sind bislang ausschließlich geplant.

## Eintrag für die Masterübersicht

Lese-Domino – Das Land der glitzernden Spinnweben: **In Entwicklung; erster neuer Abschnitt als private spielbare Vorschau umgesetzt und technisch geprüft. Geräte- und Hörprüfung offen.** 14-Abschnitts-Bauplan bestätigt; Abschnitte 2–14 noch nicht umgesetzt. Dieser Eintrag ist als Nachtrag festgehalten; eine bestehende zentrale Masterdatei wurde in diesem Schritt nicht überschrieben.
