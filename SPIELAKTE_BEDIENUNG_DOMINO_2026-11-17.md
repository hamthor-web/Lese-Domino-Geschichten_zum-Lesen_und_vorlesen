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
