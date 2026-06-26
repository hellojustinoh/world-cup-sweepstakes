# AWX Marketing · World Cup 2026 Sweepstakes

A small, festive web app to track an office World Cup 2026 sweepstakes. Twelve
players each drafted four nations across four tiers. The owner of the eventual
**champion** takes **70%** of the pot; the owner of the **runner-up** takes
**30%**.

It pulls real fixtures and results from the public ESPN scoreboard feed, builds a
live points table, and models each player's odds of owning the champion.

## Design

**Warm Editorial**, a Homerun-inspired look: cream and ink, a friendly
grotesque headline face, soft rounded cards, and circular country-flag avatars
for each player. The whole site is [`index.html`](index.html) plus
[`home.css`](home.css) / [`home.js`](home.js).

## Run locally

No build step. It's plain HTML/CSS/JS, so any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

(Opening the files directly with `file://` also works, but a server avoids
browser restrictions on the live data fetch.)

## How it's wired

Shared modules, loaded in order before each page's own script:

- **`data.js`** — config + roster. `CONFIG` holds the buy-in, pot split, and the
  `useLiveApi` flag. `PLAYERS` is the draft. `TEAM_META` carries per-team aliases
  and knockout `stage`. `POWER` is each nation's pre-tournament strength rating.
- **`flags.js`** — SVG flag renderer for every drafted nation.
- **`api.js`** — fetches the ESPN World Cup scoreboard, normalises events, and
  caches to `localStorage` for 30 minutes (manual refresh bypasses it).
- **`core.js`** — turns results into the points table, computes champion odds,
  and exposes `standings()`, `quests()` (fixtures), `pot()`, and `player()`.

Page-specific files: `home.css` and `home.js`.

## Updating through the tournament

Group results flow in automatically from the live feed. Knockout progression and
the final champion / runner-up are set manually by editing each team's `stage`
in `TEAM_META` (`data.js`): `group` → `r32` → `r16` → `qf` → `sf` → `final` →
`runnerUp` / `champion`, or `out` when eliminated.
