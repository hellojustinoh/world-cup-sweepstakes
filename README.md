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
- **`flags.js`** — real flag icons (flag-icons via jsDelivr) for every nation.
- **`api.js`** — fetches the ESPN World Cup scoreboard (results, rounds, winners)
  and the Polymarket "World Cup Winner" market (implied championship odds per
  nation). Both cache to `localStorage` (15–20 min; manual refresh bypasses it).
- **`core.js`** — derives each team's stage and elimination from the results,
  builds the points table, and computes each player's win probability from the
  Polymarket odds (falling back to a strength model if the market is
  unavailable). Standings are ranked by win probability. Exposes `standings()`,
  `quests()`, `pot()`, `player()`, and `movements()`.
- **`managers.js`** — DiceBear "personas" portraits per player, keyed to the
  roster's gender/ethnicity.

Page-specific files: `home.css` and `home.js`.

## Updating through the tournament

It runs itself. Group results, knockout progression, eliminations, and the final
champion / runner-up are all derived automatically from the live ESPN feed
(`season.slug` for the round, the winner flag for advancement). Win probability
tracks the Polymarket market live. No manual edits needed during the tournament.
