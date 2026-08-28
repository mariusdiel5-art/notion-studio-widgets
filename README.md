# Studio Widgets

Fünf statische, trackingfreie Widgets für Notion. Es gibt keine externen Abhängigkeiten, Konten, Cookies, API-Aufrufe oder Analysedienste.

## Live

Die öffentliche, von Notion einbettbare Version läuft unter:

`https://mariusdiel5-art.github.io/notion-studio-widgets/`

Für einzelne Widgets wird einer der unten dokumentierten Query-Parameter an diese Basis-URL angehängt.

## Lokal starten

```bash
python3 -m http.server 4173 --directory notion-widgets
```

Danach ist die Übersicht unter `http://localhost:4173/` erreichbar.

## Routen

- Uhr: `/?widget=clock&embed=1`
- Pomodoro: `/?widget=pomodoro&embed=1`
- Zeitfortschritt: `/?widget=progress&embed=1`
- Zinseszins: `/?widget=calculator&embed=1`
- Whiteboard: `/?widget=whiteboard&embed=1`

Die Pfade `/clock`, `/pomodoro`, `/progress`, `/calculator` und `/whiteboard` funktionieren nach einem Deployment über die Rewrite-Regel in `vercel.json` ebenfalls. Mit `theme=light` oder `theme=dark` lässt sich ein Farbschema fest einstellen; ohne Parameter folgt die Seite dem System. `embed=1` entfernt Navigation, Rahmen und Footer für die Einbettung in Notion.

## Persistenz

Der Pomodoro-Zustand, das Whiteboard und die optionale Farbschema-Auswahl werden ausschließlich im `localStorage` des Browsers gespeichert. Mit `scope=studium` oder `scope=brain` lassen sich getrennte Timer- und Whiteboard-Zustände auf derselben Domain führen. Ist lokaler Speicher im eingebetteten Browser deaktiviert, funktionieren die Widgets weiterhin, verlieren ihren Zustand aber bei einem Reload.
