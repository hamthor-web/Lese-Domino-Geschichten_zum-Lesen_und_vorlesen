# Dokumentation der Lese-Domino-Geschichten

GitHub ist ab 22.11.2026 der vorgesehene zentrale Ablageort für die laufenden Entscheidungen und Spielakten dieses Repositories. Bestehende Nachträge bleiben als Entwicklungsverlauf erhalten.

- [Masterübersicht](MASTERUEBERSICHT.md)
- [Gemeinsame Spielregeln](GEMEINSAME_SPIELREGELN.md)
- [Gestaltungsrichtlinien](GESTALTUNGSRICHTLINIEN.md)
- [Entscheidungsprotokoll](ENTSCHEIDUNGSPROTOKOLL.md)
- [Spielakte Spinnwebenreichtum](Spinnwebenreichtum/SPIELAKTE.md) und [Entscheidungen](Spinnwebenreichtum/ENTSCHEIDUNGEN.md)
- [Spielakte Die Eiche](Die_Eiche/SPIELAKTE.md) und [Entscheidungen](Die_Eiche/ENTSCHEIDUNGEN.md)

## Pflegeverfahren
Vor jeder Arbeit aktuelle GitHub-Dateien und relevante historische Quellen prüfen. Bestätigte Entscheidungen mit Datum dokumentieren. Vorschläge, Implementierung und Prüfstatus unterscheiden. Bei geänderten Entwicklungsständen die Masterübersicht anpassen. Keine Dateien oder Repositories ohne ausdrückliche Zustimmung löschen, verschieben oder überschreiben.

Diese Verwaltung gilt zunächst für **dieses** Geschichten-Repository, nicht für alle anderen Lesespiele. Ein übergreifendes Verwaltungsrepository ist eine mögliche spätere Erweiterung.


## Browserprüfung bei neuen Abschnitten

- Die gemeinsame Spielauswahl liegt unter `/`. Sie verlinkt auf die Begrüßungsseiten `/silvana/` und `/die-eiche/`. Die Adressen beziehen sich auf den Projektpfad und funktionieren auch unter dem Repository-Präfix von GitHub Pages.
- Der [Browser-Test](../shared/parchment-actions.test.cjs) folgt den beiden Links tatsächlich, prüft die jeweilige Begrüßungsseite und öffnet über „Spiel beginnen“ den ersten Abschnitt. Beim anschließenden Prüfen der Silvana-Schaltflächen verwendet der Test die so bestätigte Silvana-Adresse.
- Beim Einbau eines weiteren Abschnitts zusätzlich den Übergang vom vorherigen Abschnitt, „Spiel fortsetzen“ mit einem gespeicherten Stand im neuen Abschnitt und die Rückkehr zur Spielauswahl im Browser prüfen. Bei geänderten Einstiegspfaden die Links und die Browser-Prüfung im selben Commit aktualisieren.
- Den Einstiegstest und die Schaltflächenprüfung aus dem Repository-Stamm mit `node shared/parchment-actions.test.cjs` ausführen. Der GitHub-Workflow [Silvana Browserprüfung](../.github/workflows/silvana-browser.yml) führt sie bei Änderungen an den Spielseiten automatisch aus.
