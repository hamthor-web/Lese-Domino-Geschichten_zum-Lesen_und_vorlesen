# Spielakte · Gemeinsame Startseite von Die Eiche und Silvana

## Bestätigt am 24. November 2026

- „Installieren“ ist grau und trägt die Beschriftung „Bereits installiert“, wenn die Startseite in der installierten Web-App läuft oder der Browser die Installation bestätigt. Im normalen Browser bleibt die Installationshilfe erreichbar, etwa auf dem iPad über Safari.
- Die Startseite fragt beim Öffnen im Hintergrund nach der veröffentlichten Version. Nach einer erfolgreichen Prüfung in derselben Version steht der Button grau auf „Auf dem neuesten Stand“. Bei einer anderen veröffentlichten Version wird „Aktualisieren“ anklickbar. Ein Antippen lädt die Startseite neu.
- Ohne Internet oder bei einem Fehler steht der Button grau auf „Updateprüfung nicht möglich“. Die App prüft bei wiederhergestellter Verbindung und beim erneuten Sichtbarwerden der Startseite.
- Die grauen Buttons bleiben deutlich lesbar. Die Geschichtenauswahl ist unabhängig vom Ergebnis der Prüfung.

## Umsetzung

GitHub Pages setzt beim Veröffentlichen dieselbe Versionskennung automatisch in die Startseite und in die online abgefragte Versionsdatei ein. Dadurch zählen auch Veröffentlichungen mit Änderungen an den Geschichten. Der vorhandene Offline-Cache übernimmt die frisch geladene Startseite. Die Spielstände werden beim Aktualisieren weiterverwendet.
