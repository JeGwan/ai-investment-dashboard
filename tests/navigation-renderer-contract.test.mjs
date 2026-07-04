import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = path => readFileSync(join(root, path), "utf8");

const html = read("index.html");
const app = read("src/App.jsx");
const sidebar = read("src/components/Sidebar.jsx");
const homeView = read("src/components/HomeView.jsx");
const dashboard = read("src/components/DashboardView.jsx");
const documentViewer = read("src/components/DocumentViewer.jsx");
const markdownRenderer = read("src/components/MarkdownRenderer.jsx");
const mermaidRenderer = read("src/components/MermaidRenderer.jsx");
const styles = read("src/styles.css");
const sectors = JSON.parse(read("public/data/sectors.json"));
const manifest = JSON.parse(read("public/data/content-manifest.json"));
const packageJson = JSON.parse(read("package.json"));

assert.match(html, /id="root"/, "React app should mount into #root");
assert.match(html, /\/src\/main\.jsx/, "Vite entry should be src/main.jsx");
assert.doesNotMatch(html, /document-shelf/, "sidebar should not use separate static report/core shelves");

assert.match(dashboard, /id="dashboardView"/, "main area should expose a dashboard view container");
assert.match(homeView, /id="homeView"/, "app should include a home view");
assert.match(homeView, /@heroicons\/react\/24\/outline/, "home view should use Heroicons");
assert.match(homeView, /시장 신호와 구조 지식을 함께 보는 투자 대시보드/, "home view should introduce the dashboard");
assert.match(documentViewer, /id="documentViewer"/, "main area should expose an inline document viewer");
assert.match(documentViewer, /MarkdownRenderer/, "document viewer should render Markdown inline");
assert.match(documentViewer, /dangerouslySetInnerHTML/, "document viewer should render sanitized HTML/SVG inline");
assert.match(documentViewer, /document-meta/, "document viewer should show frontmatter-derived metadata below the title");
assert.match(documentViewer, /publishedAt/, "document viewer should expose published date metadata");
assert.match(documentViewer, /updatedAt/, "document viewer should expose updated date metadata");

assert.match(sidebar, /className="nav-title">\s*Sector\s*</, "Sector label should appear once at the top of navigation");
assert.match(sidebar, /investors/, "brand should use investors text");
assert.match(sidebar, /Powered By AI/, "brand should use Powered By AI tagline");
assert.match(sidebar, /onSelectHome/, "brand should navigate to home");
assert.match(sidebar, /ChartBarSquareIcon/, "brand should use a Heroicon");
assert.match(sidebar, /label="개념"/, "AI sector should expose a Korean concept subtree");
assert.match(sidebar, /label="보고서"/, "AI sector should expose a Korean report subtree");
assert.match(sidebar, /theme-toggle/, "sidebar should expose a light/dark mode toggle");
assert.match(sidebar, /documentMeta\(item\).*<small>/s, "core knowledge items should display frontmatter dates when available");
assert.doesNotMatch(sidebar, /sector\.enabled\s*\?\s*"Sector"\s*:\s*"Planned"/, "menu items should not repeat Sector/Planned labels");
assert.doesNotMatch(sidebar, /sidebar-note|Scope|실제 공개 데이터가 있는 지표만 포함한다/, "sidebar should not render a scope note");

assert.match(markdownRenderer, /renderMarkdownDocument/, "app should include markdown rendering");
assert.match(markdownRenderer, /splitMarkdownDocument/, "Markdown renderer should split Mermaid fences");
assert.match(markdownRenderer, /stripLeadingTitle/, "Markdown renderer should remove the duplicate leading H1");
assert.match(markdownRenderer, /DOMPurify\.sanitize/, "Markdown output should be sanitized");
assert.match(markdownRenderer, /rewriteRelativeUrls/, "Markdown renderer should rewrite relative asset links");
assert.match(mermaidRenderer, /renderMermaidDiagram/, "app should include Mermaid rendering support");
assert.match(mermaidRenderer, /renderQueue/, "Mermaid rendering should be serialized for multi-diagram documents");
assert.match(mermaidRenderer, /mermaid\.render/, "Mermaid renderer should convert Mermaid blocks to SVG");
assert.match(mermaidRenderer, /theme:\s*"base",\s*htmlLabels:\s*false,\s*flowchart:/, "Mermaid labels should use the global SVG text label setting");
assert.doesNotMatch(mermaidRenderer, /flowchart:\s*\{[\s\S]*?htmlLabels:/, "Mermaid should not rely on deprecated flowchart.htmlLabels");
assert.match(mermaidRenderer, /nodeTextColor/, "Mermaid node label text should have an explicit visible color");
assert.match(app, /setSelection\(\{ type: "report"/, "app should route report items from the sidebar");
assert.match(app, /setSelection\(\{ type: "home" \}/, "app should route brand clicks to home");
assert.match(app, /selection\.type === "home"/, "app should render a home selection");
assert.match(app, /investment-dashboard-theme/, "app should persist the selected color theme");
assert.match(app, /DocumentViewer selection=\{selection\}/, "app should route core documents to the main pane");
assert.match(app, /content-manifest\.json/, "app should load generated content manifest");
assert.match(app, /hydrateSectors/, "app should hydrate sector skeleton with generated content manifest");
assert.match(app, /mobile-gnb/, "app should expose a mobile top navigation bar");
assert.match(app, /<strong>investors<\/strong>/, "mobile GNB should use the simplified brand name");
assert.match(app, /menu-open/, "app should support mobile menu expansion");
assert.match(styles, /@media \(max-width: 860px\)/, "mobile layout should have a breakpoint");
assert.match(styles, /\.mobile-gnb/, "mobile layout should style the GNB");
assert.match(styles, /\.document-body table/, "markdown tables should be styled");
assert.match(styles, /\.document-body th,\s*\.document-body td/, "markdown table cells should have visible borders");
assert.match(styles, /\.home-grid/, "home view should have responsive card layout styles");
assert.match(styles, /:root\[data-theme="dark"\]/, "app should support dark mode via theme variables");
assert.match(styles, /\.theme-toggle/, "theme toggle should be styled");
assert.ok(packageJson.dependencies["@heroicons/react"], "Heroicons should be installed");

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
