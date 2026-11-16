# Lese-Domino – gleiche Bedienbuttons und klare Leseschrift

Stand: 16. November 2026, 19:50 Uhr (Europe/Berlin).

## Neue verbindliche Vorgaben von Heike

- Alle Bedienbuttons einer Ansicht sollen gleich breit und gleich hoch sein. Maßgeblich ist jeweils der längste und höchste Button dieser Ansicht.
- Die bisherige Schrift, insbesondere die Form des kleinen g, wird abgelehnt. Gewünscht ist eine normale, für Kinder gut lesbare Schrift, etwa Arial oder eine geeignete Alternative.

## Umsetzung

Alle sichtbaren Pergament-Bedienbuttons einschließlich Größenmenü, Vorlesen, Weiter, Prüfen, Tipp und Umstellhilfen werden je Ansicht vermessen und auf eine gemeinsame Breite und Höhe gesetzt. Die natürliche Breite des längsten Textes wird an die verfügbare Breite begrenzt. Nach dem Umbruch bestimmt der höchste Button die gemeinsame Höhe. Nach Ansichtswechsel, Änderung einer Beschriftung, Schriftvergrößerung, Laden der Schrift und Bildschirmdrehung wird neu berechnet. Auf schmalen Bildschirmen dürfen Buttons dafür untereinander stehen. Dominosteine und die Schrittanzeige sind Spiel-/Navigationselemente und werden nicht als Pergament-Bedienbuttons vermessen.

Die gesamte Anwendung einschließlich Überschriften verwendet nun **Andika**, eine klare Schrift mit einfacher einstöckiger g-Form; Arial und sans-serif sind Ersatzschriften. Die beiden Originalschriftschnitte Regular und Bold sind lokal eingebunden, damit die Buchstabenform nicht vom installierten Gerätebestand abhängt. Die Glyphenzuordnung des kleinen g wurde in beiden Originaldateien als g.SngBowl bestätigt. Überschriften sind nicht mehr in Georgia gesetzt. Schriftvergrößerung und Spielfeldvergrößerung bleiben unabhängig.

Schriftquelle: https://github.com/google/fonts/tree/main/ofl/andika
Herstellerinformation: https://software.sil.org/andika/design/
Die unveränderten Fontdateien und die SIL Open Font License liegen in vorschau-einfuehrung/assets/fonts/. Keine externen Schriftserver werden beim Spielen kontaktiert.

## Prüfungen und Veröffentlichung

JavaScript-Syntax und bisherige Domino-/Audiozustands-Logikprüfung bestanden. Im Browser wurde die Folge Anhören/Lesen/Domino bis zum richtigen Satz und Abschluss durchgespielt.

Hör-, Lese- und Dominoseite in sechs simulierten Formaten jeweils bei 100 und 160 Prozent Schrift geprüft, Spielfeld auf 160 Prozent: 360×800, 800×360, 412×915, 915×412, 768×1024, 1024×768. In den 36 Konstellationen kein horizontaler Seitenüberlauf nach der Korrektur langer Überschriften. Bei zwei Höransichten zunächst Unterschiede unter einem Pixel durch Rundung der Containerbreite gefunden; Berechnung auf tatsächliche Innenbreite geändert und betroffene Querformate sowie kleinste Hochformatansicht nachgeprüft. Die sichtbaren Bedienbuttons hatten danach exakt gleiche gemessene Breite und Höhe. Auch die Abschlussbuttons wurden auf Gleichheit kontrolliert. Ausgewählte Ansichten visuell geprüft; kein realer Android-/iPad-Test.

Private Vorschau unverändert unter:
https://silvana-einfuehrung.stable-globe-1574.chatgpt.site/

Veröffentlicht aus Sites-Quellcommit cc4e342e420d7efe89f26340d3450e0200e7c1aa. Bereitstellung erfolgreich bestätigt. Cloud-Browser benötigt für die private Live-Seite eine Anmeldung; die Funktions- und Layoutprüfung erfolgte an den identischen lokalen Dateien. Die zuvor dokumentierte Einschränkung der echten Vorlesestimme in der Testumgebung bleibt bestehen.

## Spielakte und Masterstand

Einführung spielbar; bestätigte Pastellgestaltung, eigene Spinnwebenbuttons, jetzt gleiche Buttonmaße pro Ansicht und klare Leseschrift umgesetzt. Abschnitte 2–14 noch offen; echte Geräte- und Hörprüfung ausstehend. Dieser Nachtrag ergänzt die vorherigen Arbeitsanweisungen, ohne deren Verlauf zu löschen.
