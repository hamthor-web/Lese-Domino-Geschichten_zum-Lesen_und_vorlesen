"""Erstellt den Eichen-Abzug für die Buchprobe aus den drei Web-Abschnitten."""
from pathlib import Path

target = Path(__file__).resolve().parent
source = target.parent / "die-eiche"
for number in (1, 2, 3):
    relative = Path(f"abschnitt-{number}") / "index.html"
    original = (source / relative).read_text(encoding="utf-8")
    preview = original.replace("../page-turn.", "../../die-eiche/page-turn.")
    link = '<link rel="stylesheet" href="../abschnitt.css">'
    assert preview.count("</head>") == 1
    preview = preview.replace("</head>", link + "</head>")
    (target / relative.parent).mkdir(exist_ok=True)
    (target / relative).write_text(preview, encoding="utf-8")
progress = (source / "spielstand.js").read_text(encoding="utf-8")
progress = progress.replace("die-eiche-", "eiche-buchprobe-")
(target / "spielstand.js").write_text(progress, encoding="utf-8")
