
# Rvds — Apps Showcase

Een minimalistische maar mooie portfolio van je web‑apps (HTML/JS). Gemaakt voor GitHub Pages.

## Structuur
```
/ (root)
├── index.html          # startpagina met kaarten
├── add-app.html        # webtool om apps toe te voegen (copy‑paste of GitHub API)
├── apps.json           # bronbestand met alle apps
└── assets/
    ├── css/styles.css
    └── js/
        ├── main.js
        └── add-app.js
```

Je eigen apps plaats je waar je wilt. Zet dan in `apps.json` bij elke app het juiste relatieve `path` (bijv. `apps/mini-geogebra/index.html` of `mini-geogebra.html`).

## Ontwikkelen
Open `index.html` lokaal of via GitHub Pages. De kaarten worden client‑side gerenderd vanuit `apps.json`.

## GitHub Pages
1. Commit en push alles naar je GitHub repo (bijv. `rvds-site`).
2. Ga naar **Settings → Pages** en kies **Deploy from branch** (branch `main`, folder `/root`).
3. Wacht tot de build klaar is; je site staat op `https://<username>.github.io/<repo>/`.

## Apps toevoegen
- Snelle manier: open `add-app.html`, vul de velden in, klik *Genereer JSON*, en plak het blok in `apps.json` via de GitHub UI.
- Rechtstreeks: vul je **owner**, **repo**, **branch** en **PAT** in onderaan en klik *Push naar GitHub*. (Je token wordt **niet** opgeslagen in code of repo.)

**PAT scopes:** Gebruik een fine‑grained token met alleen *Contents (Read & Write)* voor dit repo.

Veel plezier!
