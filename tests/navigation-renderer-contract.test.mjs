import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = path => readFileSync(join(root, path), "utf8");

const html = read("index.html");
const app = read("src/App.jsx");
const sidebar = read("src/components/Sidebar.jsx");
const dashboard = read("src/components/DashboardView.jsx");
const documentViewer = read("src/components/DocumentViewer.jsx");
const markdownRenderer = read("src/components/MarkdownRenderer.jsx");
const mermaidRenderer = read("src/components/MermaidRenderer.jsx");
const sectors = JSON.parse(read("public/data/sectors.json"));

assert.match(html, /id="root"/, "React app should mount into #root");
assert.match(html, /\/src\/main\.jsx/, "Vite entry should be src/main.jsx");
assert.doesNotMatch(html, /document-shelf/, "sidebar should not use separate static report/core shelves");

assert.match(dashboard, /id="dashboardView"/, "main area should expose a dashboard view container");
assert.match(documentViewer, /id="documentViewer"/, "main area should expose an inline document viewer");
assert.match(documentViewer, /MarkdownRenderer/, "document viewer should render Markdown inline");
assert.match(documentViewer, /dangerouslySetInnerHTML/, "document viewer should render sanitized HTML/SVG inline");

assert.match(sidebar, /className="nav-title">\s*Sector\s*</, "Sector label should appear once at the top of navigation");
assert.match(sidebar, /Core Knowledge/, "AI sector should expose a Core Knowledge subtree");
assert.match(sidebar, /Reports/, "AI sector should expose a Reports subtree");
assert.doesNotMatch(sidebar, /sector\.enabled\s*\?\s*"Sector"\s*:\s*"Planned"/, "menu items should not repeat Sector/Planned labels");

assert.match(markdownRenderer, /renderMarkdownDocument/, "app should include markdown rendering");
assert.match(markdownRenderer, /DOMPurify\.sanitize/, "Markdown output should be sanitized");
assert.match(markdownRenderer, /rewriteRelativeUrls/, "Markdown renderer should rewrite relative asset links");
assert.match(mermaidRenderer, /renderMermaidDiagrams/, "app should include Mermaid rendering support");
assert.match(mermaidRenderer, /mermaid\.run/, "Mermaid renderer should convert Mermaid blocks");
assert.match(app, /setSelection\(\{ type: "report"/, "app should route report items from the sidebar");
assert.match(app, /DocumentViewer selection=\{selection\}/, "app should route core documents to the main pane");

for (const item of sectors.coreKnowledge) {
  assert.ok(item.format, `core knowledge item needs a format: ${item.title}`);
  assert.ok(existsSync(join(root, "public", item.href.replace(/^\.\//, ""))), `missing core knowledge file: ${item.href}`);
}

const activeSector = sectors.sectors.find(sector => sector.id === sectors.activeSectorId);
assert.ok(activeSector, "active sector should exist");
const reportItems = activeSector.subsectors.flatMap(subsector => subsector.reports || []);
assert.ok(reportItems.length > 0, "active sector should have report items");

for (const item of reportItems) {
  assert.ok(item.format, `report item needs a format: ${item.title}`);
  assert.ok(existsSync(join(root, "public", item.href.replace(/^\.\//, ""))), `missing report file: ${item.href}`);
  assert.ok(existsSync(join(root, "public", item.dataPath.replace(/^\.\//, ""))), `missing report data: ${item.dataPath}`);
}
