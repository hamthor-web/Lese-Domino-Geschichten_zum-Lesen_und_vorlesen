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
