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
const styles = read("src/styles.css");
const sectors = JSON.parse(read("public/data/sectors.json"));
const manifest = JSON.parse(read("public/data/content-manifest.json"));

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
assert.match(markdownRenderer, /splitMarkdownDocument/, "Markdown renderer should split Mermaid fences");
assert.match(markdownRenderer, /DOMPurify\.sanitize/, "Markdown output should be sanitized");
assert.match(markdownRenderer, /rewriteRelativeUrls/, "Markdown renderer should rewrite relative asset links");
assert.match(mermaidRenderer, /renderMermaidDiagram/, "app should include Mermaid rendering support");
assert.match(mermaidRenderer, /mermaid\.render/, "Mermaid renderer should convert Mermaid blocks to SVG");
assert.match(app, /setSelection\(\{ type: "report"/, "app should route report items from the sidebar");
assert.match(app, /DocumentViewer selection=\{selection\}/, "app should route core documents to the main pane");
assert.match(app, /content-manifest\.json/, "app should load generated content manifest");
assert.match(app, /hydrateSectors/, "app should hydrate sector skeleton with generated content manifest");
assert.match(app, /mobile-gnb/, "app should expose a mobile top navigation bar");
assert.match(app, /menu-open/, "app should support mobile menu expansion");
assert.match(styles, /@media \(max-width: 860px\)/, "mobile layout should have a breakpoint");
assert.match(styles, /\.mobile-gnb/, "mobile layout should style the GNB");

for (const item of manifest.coreKnowledge) {
  assert.ok(item.format, `core knowledge item needs a format: ${item.title}`);
  assert.ok(existsSync(join(root, "public", item.href.replace(/^\.\//, ""))), `missing core knowledge file: ${item.href}`);
}

const activeSector = sectors.sectors.find(sector => sector.id === sectors.activeSectorId);
assert.ok(activeSector, "active sector should exist");
const reportItems = manifest.reports.filter(report => report.sectorId === activeSector.id);
assert.ok(reportItems.length > 0, "active sector should have report items");

for (const item of reportItems) {
  assert.ok(item.format, `report item needs a format: ${item.title}`);
  assert.ok(existsSync(join(root, "public", item.href.replace(/^\.\//, ""))), `missing report file: ${item.href}`);
  assert.ok(existsSync(join(root, "public", item.dataPath.replace(/^\.\//, ""))), `missing report data: ${item.dataPath}`);
}
