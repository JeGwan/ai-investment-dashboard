# AI Investment Dashboard

Public investment dashboard for tracking AI-sector market signals with source-backed data.

The initial section is `AI > Semiconductors`, focused on token-price trends, AI adoption, and semiconductor revenue indicators. The dashboard is a Vite/React static site hosted on GitHub Pages.

## Data Policy

- Use actual public data only.
- Do not add synthetic, assumed, interpolated, or internally estimated data.
- Every metric must include a source URL.
- If a metric has no reliable public time series, list it as excluded instead of charting it.

## Local Preview

```bash
npm install
npm run dev -- --port 4173
```

Then open `http://127.0.0.1:4173/ai-investment-dashboard/`.

## Structure

- `src/App.jsx` - application state and view routing
- `src/components/Sidebar.jsx` - sector tree navigation
- `src/components/DashboardView.jsx` - report dashboard and charts
- `src/components/DocumentViewer.jsx` - inline document viewer
- `src/components/MarkdownRenderer.jsx` - Markdown and Mermaid rendering
- `public/data/sectors.json` - sector, report, and core-knowledge navigation
- `public/data/content-manifest.json` - generated document manifest for the sidebar
- `public/reports/<sector>/<subsector>/YYYY-MM-DD-title/report.md` - dated one-off reports
- `public/reports/<sector>/<subsector>/YYYY-MM-DD-title/data/metrics.json` - report-specific source-backed metrics and excluded indicators
- `public/core-knowledge/<sector>/<subsector>/*.md` - evergreen core knowledge
- `scripts/generate-content-manifest.mjs` - scans reports and core knowledge into `content-manifest.json`

## Collaboration

Small, reviewable changes are preferred. When adding a metric, update the active report's `data/metrics.json`, include source links, and verify that labels and values have matching lengths.

Reports should be dated and tied to a sector/subsector. Keep the report markdown and the data used by that report in the same report directory. Core knowledge should contain stable definitions, causal maps, and reusable background context rather than time-sensitive market observations.

Markdown documents must include frontmatter:

```md
---
title: 문서 제목
publishedAt: 2026-07-04
updatedAt: 2026-07-04
---
```

`npm run dev`, `npm run build`, and `npm test` regenerate the sidebar manifest automatically.
