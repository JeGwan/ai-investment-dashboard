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
- `data/metrics.json` - source-backed metrics and excluded indicators

## Collaboration

Small, reviewable changes are preferred. When adding a metric, update `data/metrics.json`, include source links, and verify that labels and values have matching lengths.
