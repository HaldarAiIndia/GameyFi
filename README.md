# GameyFi

Static gaming site (HTML5, CSS3, vanilla JS). Hosted on GitHub + Vercel: https://GameyFi.vercel.app/

## Folder tree
```
GameyFi/
├── index.html          homepage (all CSS + JS embedded)
├── games.json          game catalogue (you edit this)
├── maintenance.json    maintenance switch + countdown
├── manifest.json       PWA metadata
├── service-worker.js   caching + offline fallback
├── offline.html        offline fallback page
├── 404.html            shown by Vercel for missing pages/folders
├── favicon.png
├── icons/icon-192.png, icon-512.png
├── ludo/index.html         Ludo & Snakes
├── bead-16/index.html      Bead 16
├── tic-tac-toe/index.html  Tic Tac Toe
├── carrom/index.html       Carrom Pool
└── 8-ball-pool/index.html  8-Ball Pool
```
The game files are byte-for-byte copies of the files you supplied.

## Upload to GitHub, deploy on Vercel
1. Create an empty repository on github.com (e.g. `GameyFi`).
2. In the `GameyFi` folder: `git init`, `git add .`, `git commit -m "Initial GameyFi"`, `git branch -M main`, `git remote add origin <repo-url>`, `git push -u origin main`.
3. On vercel.com choose Add New > Project, import the repository.
4. Framework Preset: **Other**. Build command: leave empty. Output directory: leave empty (project root). Deploy.
5. Project Settings > Domains: make sure `GameyFi.vercel.app` is assigned.
Every later `git push` to `main` redeploys automatically. Creating folders on your computer changes nothing online until you commit and push.

## Add a game
1. Create a folder at the repo root, e.g. `puzzle/`, with its own `index.html` and assets.
2. Add an entry to `games.json`:
```json
{ "name": "Puzzle", "description": "One short sentence.", "category": 2, "order": 3,
  "folder": "puzzle", "image": "https://your-host.com/puzzle.png", "visibility": "public" }
```
3. `git add . && git commit -m "Add puzzle" && git push`.

Fields: `folder` letters/numbers/`-`/`_` only (no dots, no URLs). `image` must be https, or `""` for generated fallback art. `order` sorts within a category (ties sort by name; nothing is hidden). `category` is a number; labels come from the `"categories"` object in `games.json` (unlabelled ids show "Category").

**Change visibility:** set `"visibility"` to `"public"` or `"private"`. Missing/invalid values hide the game.
**Thumbnails:** all `image` values are empty, so cards show generated art. Put your own hosted https URLs in `games.json`.

## Maintenance mode
Edit `maintenance.json`, commit, push:
```json
{ "maintenance": "on", "message": "Back at 6pm.", "countdownEnabled": true, "countdownEnd": "2026-11-01T18:00:00+06:00" }
```
Set `"maintenance": "off"` to reopen. The countdown never turns maintenance off by itself; at zero it asks the visitor to check again. If the file is missing or invalid, the site opens normally. Use an explicit timezone in `countdownEnd`.

## Limitations (static hosting)
- `private` only hides a game from the homepage and search. Anyone who knows `/folder/` or reads `games.json` can still reach it. This is not access control.
- Maintenance mode is read by the browser. It needs a commit, push and finished deploy, can be delayed by caches, and does not block direct game URLs.
- A static site cannot scan repo folders; `games.json` is the source of truth. (Later you could add a GitHub Action that validates `games.json` against the folders on each push.)
- Service workers and install need HTTPS (Vercel provides it) or localhost.
- The games load Tailwind and Inter from external CDNs. The service worker caches them after a first online visit, so games may work offline, but offline play has not been tested.
- Games have no built-in link back to GameyFi. In an installed iOS app there is no browser back button, so adding a home link to each game is worth considering.