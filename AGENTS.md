# AGENTS.md

## Project

This repository is a public AI investment dashboard. The first active section is `AI > Semiconductors`.

## Data Rules

- Use only real public data from primary or clearly documented sources.
- Do not add synthetic, assumed, interpolated, or internally estimated values.
- Every rendered metric must include source links in the active report's `public/reports/.../data/metrics.json`.
- Metrics without reliable public time-series data belong in `excludedIndicators`, not in charts.

## Design And Code Patterns

- Keep concerns separated: data, rendering logic, layout, and styles should stay easy to inspect independently.
- Prefer focused React components; avoid returning to broad manual DOM mutation.
- Organize future expansion by domain/sector, not by technical layer alone.
- Keep UI components conceptually split between stateful containers and presentational sections.
- Reusable compound UI patterns are appropriate for future navigation, tabs, filters, and data tables.
- Verify changes with `npm test`, `npm run build`, JSON validation, and a local server smoke test.
- The mobile layout uses a slim top GNB and an off-canvas menu; keep desktop sidebar behavior separate from mobile navigation behavior.

## Content Structure

- Dated reports use `public/reports/<sector>/<subsector>/YYYY-MM-DD-title/report.md`.
- Report data lives beside the report at `public/reports/<sector>/<subsector>/YYYY-MM-DD-title/data/metrics.json`.
- Evergreen core knowledge uses `public/core-knowledge/<sector>/<subsector>/title.md`.
- Register sector skeletons in `public/data/sectors.json`.
- Do not hand-edit document lists in `public/data/sectors.json`; `scripts/generate-content-manifest.mjs` scans Markdown/HTML/SVG files and writes `public/data/content-manifest.json`.
- Markdown documents must include `title`, `publishedAt`, and `updatedAt` frontmatter.
- Keep one-off market observations in reports; keep durable definitions and causal maps in core knowledge.
- Markdown, HTML, SVG, and Mermaid content should render inside the main document viewer, not as downloads.

## Public Repo Hygiene

- Do not include private workspace context, credentials, or non-public notes.
- Keep explanations concise and useful for external collaborators.
