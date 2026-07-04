# React Document Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the static dashboard to a React app with a sector tree, inline report/core document viewer, and Markdown/HTML/SVG/Mermaid rendering.

**Architecture:** Vite serves a React shell from `src/`, while real source-backed documents and report-local data remain static files under `public/`. Sidebar state selects either a report dashboard or a document viewer; document rendering is isolated behind renderer components.

**Tech Stack:** Vite, React, marked, DOMPurify, Mermaid, Node contract tests, GitHub Pages.

---

### Task 1: React Shell And Static Asset Layout

**Files:**
- Create: `package.json`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Modify: `index.html`
- Move: `data/`, `reports/`, `core-knowledge/` to `public/`

- [x] Add Vite/React dependencies and build scripts.
- [x] Keep static source-backed data in `public/` so Pages exposes `/data`, `/reports`, and `/core-knowledge`.
- [x] Use `import.meta.env.BASE_URL` when fetching static files.

### Task 2: Sidebar Tree

**Files:**
- Create: `src/components/Sidebar.jsx`
- Modify: `data/sectors.json`

- [x] Render a single top-level `Sector` label.
- [x] Render each sector as an accordion without per-item `Sector` or `Planned` labels.
- [x] Under an open sector, show `Core Knowledge` and `Reports`.
- [x] Under `Reports`, show report items such as `토큰 최적화와 AI 반도체 수요`.

### Task 3: Dashboard And Report Data

**Files:**
- Create: `src/components/DashboardView.jsx`
- Create: `src/lib/charting.js`
- Create: `src/lib/formatters.js`

- [x] Load the selected report's `dataPath`.
- [x] Preserve existing canvas charts, KPI cards, normalization toggle, sources, and excluded indicators.

### Task 4: Inline Document Viewer

**Files:**
- Create: `src/components/DocumentViewer.jsx`
- Create: `src/components/MarkdownRenderer.jsx`
- Create: `src/components/MermaidRenderer.jsx`
- Create: `src/lib/documents.js`

- [x] Fetch selected Markdown/HTML/SVG content and render it in the main pane.
- [x] Render Markdown via `marked` and sanitize with DOMPurify.
- [x] Render fenced `mermaid` blocks with Mermaid.
- [x] Render SVG files inline after sanitization.

### Task 5: Verification And Deployment

**Files:**
- Modify: `.github/workflows/pages.yml`
- Test: `tests/navigation-renderer-contract.test.mjs`

- [x] Run contract test before and after implementation.
- [x] Run `npm run build`.
- [x] Run local server on port `4173`.
- [ ] Push and verify GitHub Pages.
