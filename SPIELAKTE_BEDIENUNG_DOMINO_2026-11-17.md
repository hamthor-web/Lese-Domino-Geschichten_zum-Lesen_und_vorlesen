# Silvana – Bedienung von Domino und Navigation
Stand: 17.11.2026

## Bestätigter Auftrag
Heike beanstandet die Reihenfolge Zurück über Weiter im Hochformat, die Richtungstexte „Nach links“/„Nach rechts“ bei untereinander liegenden Steinen und unzuverlässiges direktes Verschieben. Gewünscht ist eine dünne Linie als Hinweis auf die Einfügestelle.

## Umsetzung
- Zurück/Weiter: bei ausreichend Platz Zurück links, Weiter rechts. Bei notwendigem Umbruch steht Weiter zuerst, Zurück darunter. Große Schrift und unverzerrte Schaltflächendekoration bleiben erhalten. Diese responsive Anordnung ist die konkrete Umsetzung der gewünschten Korrektur.
- Doppelte Zurückbuttons oberhalb der Inhalte in Einführung und Szene 2 entfallen. Alle entsprechenden Rückwege bleiben unten erreichbar, einschließlich Einführung: Domino → Lesetext, Abschluss → Domino; Szene 2: Hörschritt → Einführungsabschluss, Abschluss → Wetteraufgabe.
- Im Hochformat liegen die Dominosteine eindeutig untereinander. Die Verschiebebuttons heißen „Nach oben“ und „Nach unten“. Im Querformat heißen sie weiterhin „Nach links“ und „Nach rechts“; ein Formatwechsel aktualisiert die Beschriftung.
- Das direkte Verschieben arbeitet für Touch, Stift und Maus mit Pointer-Ereignissen und Pointer-Capture. Ab einer Bewegung von acht Pixeln wird gezogen; ein einfaches Antippen bleibt erhalten.
- Eine dünne violette Einfügelinie zeigt die Zielposition vor, zwischen oder hinter Steinen. Beim Loslassen wird der Stein in die Reihenfolge eingesetzt; der bisherige Index wird dabei berücksichtigt. Keine zusätzlichen sichtbaren Kästen oder dauerhaften Platzhalter.
- An den oberen/unteren Bildschirmrändern scrollt das Ziehen automatisch. Abbruch, Fokusverlust und Navigation entfernen den Hinweis ohne unbeabsichtigtes Umordnen. Ein weiterer Klick nach dem Ziehen bleibt möglich.
- Antippen zum Anlegen/Auswählen, Verschiebebuttons, Zurücklegen, Satzprüfung, Tipps und Speicherung bleiben erhalten. Originalbilder, literarische Texte und Animationen unverändert.

## Prüfung
Vorhandene Logiktests bestanden: Satzreihenfolgen, Korrektur, Eingabegrenzen, Sprachausgabe und Antwort-/Hilferegeln.
Neuer Chrome-Browserlauf prüft tatsächliche Maus-Pointer und über Chrome-Eingabeereignisse ausgelöste Touch-Pointer: Umordnen in beide Richtungen, Einfügelinie, Touch-Abbruch, Einsetzen aus dem Vorrat, Richtungswechsel beim Formatwechsel und Rücknavigation mit erhaltener Reihenfolge.
Je 192 Layoutprüfungen vor Veröffentlichung und auf GitHub Pages: 24 Dominoansichten plus 168 bisherige Spiel-/Wetter-/Lupenansichten. Sechs Smartphone-/Tablet-Viewports, jeweils vier getrennte Schrift-/Spielfeldkombinationen. Navigation auf zulässige Anordnung, ausreichend große Flächen und horizontalen Überlauf geprüft.
Vollständiger bestehender Spielablauf mit Kisten, Rollen, Wetterbild-Lupe, Sonnentag-Wiederholung, Weiter-MP4, Spinnenfragen, zwei Antwortfeldern, Vergleichsbildern und Wiederholung weiterhin erfolgreich. Keine JavaScript-Fehler; bestehender vollständiger Durchlauf auch ohne HTTP-Fehler.
Zusätzlich persönliche Live-Sichtprüfung am Desktop: direkte Verschiebung des ersten Steins ans Satzende und korrekte neue Reihenfolge im Spielfeld.
Keine physischen Endgeräte geprüft; automatisierte Sprachdienste weiterhin simuliert, keine akustische Hörprüfung.

## Veröffentlichung
PR #8; Code-Merge: `2e7cd93a9dbbbb2d7472ec8c4603bf7f7224e16e`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44054360463
Spiel: https://hamthor-web.github.io/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/vorschau-einfuehrung/

Abschließender Programmstand mit begrenztem Randscrollen und stabilisierten Browserprüfungen: `7c5b4ad6e71867c700ab3119dee221f5e4b38848`.


## Kleiner Tipp nach richtiger Satzprüfung ausblenden – 17.11.2026
Heikes Vorgabe: Ist der Satz richtig geordnet, wird „Kleiner Tipp“ nicht mehr gebraucht.
Umgesetzt: Nach erfolgreicher Satzprüfung ist der Tippbutton ausgeblendet. Wird die Reihenfolge danach wieder verändert, erscheint er erneut. Die bisherige freie Legung und Prüfung per Knopfdruck bleiben erhalten; vor erfolgreicher Prüfung wird keine Lösung vorweggenommen.
Vorhandene Logiktests und vollständiger Browserdurchlauf einschließlich Live-Prüfung bestanden. Sichtbarkeit vor/nach Satzprüfung und nach erneutem Verschieben geprüft. Übrige Funktionen und Originalassets erhalten.
Code: `1afe2530d0897af06532b362be5ea47fbd755f0e`.
Live-Prüflauf: https://github.com/hamthor-web/Lese-Domino-Geschichten_zum-Lesen_und_vorlesen/actions/runs/44068339781
