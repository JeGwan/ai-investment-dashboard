import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = path => readFileSync(join(root, path), "utf8");

const packageJson = JSON.parse(read("package.json"));
assert.equal(packageJson.scripts.manifest, "node scripts/generate-content-manifest.mjs");
assert.match(packageJson.scripts.dev, /npm run manifest/);
assert.match(packageJson.scripts.build, /npm run manifest/);
assert.match(packageJson.scripts.test, /npm run manifest/);

assert.ok(existsSync(join(root, "scripts/generate-content-manifest.mjs")), "manifest generator should exist");
assert.ok(existsSync(join(root, "public/data/content-manifest.json")), "generated content manifest should exist");

const manifest = JSON.parse(read("public/data/content-manifest.json"));
assert.ok(Array.isArray(manifest.coreKnowledge), "manifest should expose coreKnowledge");
assert.ok(Array.isArray(manifest.reports), "manifest should expose reports");
assert.ok(manifest.coreKnowledge.length >= 1, "manifest should include core knowledge docs");
assert.ok(manifest.reports.length >= 1, "manifest should include existing reports");
assert.ok(
  manifest.coreKnowledge.some(item => item.title === "AI 데이터센터 랙 계층과 구성도"),
  "core knowledge should include the AI data center rack note"
);
assert.ok(
  manifest.coreKnowledge.every(item => item.title !== "AI 반도체 수요 구조" && item.title !== "HBM / Memory / Packaging Primer"),
  "core knowledge should not include placeholder sample docs"
);

for (const item of [...manifest.coreKnowledge, ...manifest.reports]) {
  assert.ok(item.title, `manifest item needs title: ${item.href}`);
  assert.ok(item.publishedAt, `manifest item needs publishedAt: ${item.href}`);
  assert.ok(item.updatedAt, `manifest item needs updatedAt: ${item.href}`);
  assert.ok(item.sectorId, `manifest item needs sectorId: ${item.href}`);
  assert.ok(item.subsectorId, `manifest item needs subsectorId: ${item.href}`);
  assert.ok(item.format, `manifest item needs format: ${item.href}`);
  assert.ok(existsSync(join(root, "public", item.href.replace(/^\.\//, ""))), `manifest href should exist: ${item.href}`);
}

for (const report of manifest.reports) {
  assert.ok(report.dataPath, `report needs dataPath: ${report.href}`);
  assert.ok(existsSync(join(root, "public", report.dataPath.replace(/^\.\//, ""))), `report data should exist: ${report.dataPath}`);
}
