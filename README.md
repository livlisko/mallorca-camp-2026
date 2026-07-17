# Mallorca 2026 — Sa Calobra Camp Guide

A personal, Strava-flavored trip dashboard for the Sa Calobra CC Mallorca cycling camp,
**October 17–24, 2026** (6 rides · 555 km · 8,795 m · 17 categorised climbs).

Pure static site — no build step, no dependencies, works offline.

## Run it

Option A — just open the file:

    open index.html

Option B — serve it (nicer URLs, identical behavior):

    python3 -m http.server 8641
    # then open http://localhost:8641

## Deploy to GitHub Pages

The repo is commit-ready. Once `gh auth login` has been run:

    gh repo create mallorca-camp-2026 --public --source . --push
    gh api repos/{owner}/mallorca-camp-2026/pages -f 'source[branch]=main' -f 'source[path]=/'

The site works from the repository root — no build step needed.

## What's inside

| File | Purpose |
|---|---|
| `index.html` | Shell page (header, footer, mount point) |
| `styles.css` | "Tramuntana dusk" theme, responsive layout |
| `data.js` | All camp + stage data (see data provenance below) |
| `app.js` | Hash router, dashboard + stage rendering, week chart, unit toggle |
| `assets/` | Official stage profile + route map images (downloaded from sacalobra.cc) |

## Data provenance

- **Hard stats** (dates, distance, elevation, est. time, difficulty, climb count, climb list):
  the camp spreadsheet *"Mallorca camp oct 16-24 2026 (Sa Calobra).xlsx"* — the source of truth.
- **Stage links**: the exact hyperlinks extracted from the workbook (`stage/1`…`stage/6`).
  Note the camp rides **stage 6 (Sa Calobra) on Thursday** and **stage 5 (Formentor) on Friday** —
  the workbook's column order — and the site preserves that mapping.
- **Descriptions, Strava segment tables (KOM/QOM), TSS, feed zones, profile/map images**:
  scraped from the official sacalobra.cc stage pages. The pages' visible "Stats" render as
  zeros (JS counters), so per-stage TSS/feed zones were read from the underlying
  `data-count` attributes; distance/elevation/time/difficulty always come from the spreadsheet.

### Known data notes

- The spreadsheet's climbs cell for the Caffeine Ride lists "Tofla (cat 4)" but its own
  `# Climbs` row says 0, and the official stage 4 page says "no climb on the menu" — the
  site shows 0 climbs.
- The official stage 2 segment table calls the final climb "Felanitx" (cat 2); the
  spreadsheet calls it "Sant Salvador" (cat 3). Same climb — the site shows both names
  with a footnote.
- Sheet totals row had broken formulas (0 for total km/m); totals are computed from the
  per-stage values: 555 km / 8,795 m (the official camp page says 551 km / 8,784 m because
  it uses slightly different per-stage numbers; the spreadsheet wins per project rules).

## Intentionally not included

No accounts, backend, database, GPS/GPX maps (none published on the official pages),
social features, build tooling, or analytics.
