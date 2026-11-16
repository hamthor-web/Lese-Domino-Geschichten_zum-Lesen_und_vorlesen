# Lese-Domino – Textumbruch ohne automatische Silbentrennung

Bestätigte Vorgabe von Heike am 16. November 2026: Wörter sollen bevorzugt vollständig auf einer neuen Zeile beginnen, statt mit Bindestrich geteilt zu werden.

Umgesetzt: automatische Silbentrennung in Überschriften ausgeschaltet; für die Anwendung ausdrücklich hyphens: none und -webkit-hyphens: none gesetzt. Normale Umbrüche zwischen Wörtern bleiben erhalten. Nur bei einem einzelnen Wort, das selbst breiter als die komplette verfügbare Zeile ist, bleibt der bestehende Notumbruch ohne eingefügten Bindestrich möglich, damit bei großer Schrift keine Inhalte abgeschnitten werden.

Browserprüfung: neue Überschrift visuell ohne Bindestriche geprüft, berechnetes hyphens: none bestätigt. Kein geänderter Spieltext und keine neue Spielmechanik. CSS-Version in der Startdatei auf v5 erhöht, damit die Änderung beim erneuten Laden ankommt.

Spielakte: reine Gestaltungskorrektur der vorhandenen Einführung; übriger Entwicklungsstand unverändert. Die Vorlese- und Geräteprüfung bleibt wie zuvor dokumentiert offen.
