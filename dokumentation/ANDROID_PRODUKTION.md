# Android-Produktion für „Geschichten zum Lesen und Vorlesen“

**Stand 28.11.2026 · Planung.** Im Repository existieren die gemeinsame Web-App (PWA) und ein GitHub-Actions-Workflow für Browserprüfungen. Android-Projekt, signiertes Android App Bundle (AAB) und Play-Upload-Workflow sind im Hauptzweig noch nicht vorhanden. Ein zugehöriger Play-Console-Eintrag ist für dieses Repository noch nicht belegt.

## Umfang und Entscheidungen vor dem ersten Build

- Ausgangspunkt ist [die gemeinsame Spielauswahl](../index.html) mit Silvana und Die Eiche. Für Android ist eine gemeinsame App entsprechend der Webfassung vorgesehen. Das genaue Angebot der ersten Version wird vor dem Build festgelegt. Der [Webstand](MASTERUEBERSICHT.md) umfasst 14 Silvana-Szenen und die ersten drei Eichen-Abschnitte.
- Für Android die verfügbare Bildschirmfläche direkt für Lesen und Spielen nutzen. Die [animierte Buchansicht als Spielfläche](MASTERUEBERSICHT_NACHTRAG_GESCHICHTENBUCH_2026-11-26.md) wurde wegen des Platzverlusts verworfen. Die Buchtests und die Eichen-Buchprobe bleiben außerhalb des Builds.
- Beim Festlegen des Umfangs den Eichen-Buchausblick und das [Monatsdomino-Konzept](../KONZEPT_EICHE_MONATSDOMINO.md) berücksichtigen. Für den Build die freigegebenen Spielpfade und Medien bündeln.
- Vor der Einrichtung prüfen, ob bereits ein Store-Eintrag für genau diese App besteht. Paketname (`applicationId`), App-Titel, Sprache, Zielgruppe und Store-Eintrag dokumentieren. Bei einem vorhandenen Eintrag Paketname und Signierung mit dem bestehenden Eintrag abgleichen.
- Android-Ansatz anhand eines kleinen Geräteprototyps festlegen. Dafür Medienwiedergabe und Vorlesestimme, Offline-Umfang und Spielstände prüfen. Das Webspiel speichert Spielstände lokal im Browser. Die Übernahme vorhandener PWA-Spielstände in die Android-App hängt vom gewählten Ansatz ab und muss separat geprüft werden. Der [Web-Service-Worker](../sw.js) behandelt Audio und Video außerhalb seines Caches.

## Vom Git-Stand zum Play-Release

| Schritt | Ergebnis |
| --- | --- |
| **1. Webstand auswählen** | Git-Commit und Inhaltsumfang festhalten. Die [vorhandenen Browserprüfungen](../.github/workflows/silvana-browser.yml) ausführen und beide Spiele auf Smartphone und Tablet in Hoch- und Querformat prüfen. |
| **2. Android-Build einrichten** | Aus dem ausgewählten Git-Stand ein mit dem Upload-Schlüssel signiertes AAB bauen. Für jede neue Version einen höheren `versionCode` setzen und `versionName`, Git-Commit und Prüfsumme des AAB dokumentieren. Play App Signing im zugehörigen Eintrag einrichten bzw. abgleichen. Zugangsdaten und Upload-Schlüssel geschützt hinterlegen. |
| **3. Internen Test starten** | App-Eintrag bei Bedarf einmalig in der Play Console anlegen. AAB in den internen Test bringen. Auf echten Android-Geräten Installation und Update, getrennte Spielstände, Fortsetzen und Zurücksetzen, Zurück-Navigation, Vorlesen, Videos, beide Größenregler und den vereinbarten Offline-Umfang prüfen. |
| **4. Store vorbereiten** | Freigegebene Beschreibung, Übersetzungen, Screenshots und Grafiken versioniert in GitHub pflegen. Angaben zu Zielgruppe, Daten und Inhaltsbewertung in der Play Console vervollständigen. Prüfen, welche geschlossenen Tests und Produktionsfreigaben für das Konto erforderlich sind. |
| **5. Produktion freigeben** | Dasselbe getestete AAB anhand des `versionCode` für Produktion auswählen. Freigabe gezielt auslösen und den Status in der Play Console prüfen. Im Repo Versionsnummer, Track und Status festhalten. Als veröffentlicht gilt die Version, sobald ihre Verfügbarkeit bestätigt ist. |

## Geplante Automatisierung

GitHub → GitHub Actions → signiertes AAB → Google Play Developer Publishing API → interner Test → geprüfte Produktionsfreigabe.

GitHub Actions soll später Build, Prüfungen und den Upload in den internen Test übernehmen. Die Publishing API unterstützt bei einem eingerichteten App-Eintrag auch die Übertragung freigegebener lokalisierter Store-Texte, Screenshots und Grafiken. Änderungen am Produktions-Track sollen als eigener freigegebener Schritt ausgelöst werden. Browser-Installation und Web-Updates richten sich weiterhin nach der [Web-App-Dokumentation](GEMEINSAME_STARTSEITE_APP_STATUS_2026-11-24.md).

[App in der Play Console einrichten](https://support.google.com/googleplay/android-developer/answer/9859152) · [App-Signierung](https://developer.android.com/studio/publish/app-signing) · [Android-Versionierung](https://developer.android.com/studio/publish/versioning) · [Google Play Publishing API](https://developers.google.com/android-publisher/) · [Testanforderungen für neue persönliche Entwicklerkonten](https://support.google.com/googleplay/android-developer/answer/14151465)
