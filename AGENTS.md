# AGENTS.md

## Project

This repository is a public AI investment dashboard. The first active section is `AI > Semiconductors`.

## Data Rules

- Use only real public data from primary or clearly documented sources.
- Do not add synthetic, assumed, interpolated, or internally estimated values.
- Every rendered metric must include source links in `data/metrics.json`.
- Metrics without reliable public time-series data belong in `excludedIndicators`, not in charts.

## Design And Code Patterns

- Keep concerns separated: data, rendering logic, layout, and styles should stay easy to inspect independently.
- Prefer simple static architecture unless a real need justifies more tooling.
- Organize future expansion by domain/sector, not by technical layer alone.
- Keep UI components conceptually split between stateful containers and presentational sections.
- Reusable compound UI patterns are appropriate for future navigation, tabs, filters, and data tables.
- Verify changes with JSON validation, JavaScript syntax checks, and a local browser/server smoke test.

## Public Repo Hygiene

- Do not include private workspace context, credentials, or non-public notes.
- Keep explanations concise and useful for external collaborators.
