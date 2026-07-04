# AI Investment Dashboard

Public investment dashboard for tracking AI-sector market signals with source-backed data.

The initial section is `AI > Semiconductors`, focused on token-price trends, AI adoption, and semiconductor revenue indicators. The dashboard is a static site hosted on GitHub Pages.

## Data Policy

- Use actual public data only.
- Do not add synthetic, assumed, interpolated, or internally estimated data.
- Every metric must include a source URL.
- If a metric has no reliable public time series, list it as excluded instead of charting it.

## Local Preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Structure

- `index.html` - static app shell and investment dashboard layout
- `styles.css` - visual system and responsive layout
- `app.js` - chart rendering and dashboard state
- `data/sectors.json` - sector, subsector, report, and core-knowledge navigation
- `reports/<sector>/<subsector>/YYYY-MM-DD-title/report.md` - dated one-off reports
- `reports/<sector>/<subsector>/YYYY-MM-DD-title/data/metrics.json` - report-specific source-backed metrics and excluded indicators
- `core-knowledge/<sector>/<subsector>/*.md` - evergreen core knowledge

## Collaboration

Small, reviewable changes are preferred. When adding a metric, update the active report's `data/metrics.json`, include source links, and verify that labels and values have matching lengths.

Reports should be dated and tied to a sector/subsector. Keep the report markdown and the data used by that report in the same report directory. Core knowledge should contain stable definitions, causal maps, and reusable background context rather than time-sensitive market observations.
