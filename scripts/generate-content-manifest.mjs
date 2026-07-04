import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const outputPath = join(publicDir, "data/content-manifest.json");
const supportedExtensions = new Set([".md", ".html", ".svg"]);

const formatByExtension = {
  ".md": "markdown",
  ".html": "html",
  ".svg": "svg"
};

const listFiles = dir => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(path);
    return [path];
  });
};

const parseFrontmatter = (filePath, required = true) => {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!match) {
    if (!required) return {};
    throw new Error(`Missing frontmatter: ${relative(root, filePath)}`);
  }

  return match[1].split("\n").reduce((result, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return result;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    result[key] = value;
    return result;
  }, {});
};

const requireFields = (frontmatter, fields, filePath) => {
  const missing = fields.filter(field => !frontmatter[field]);
  if (missing.length > 0) {
    throw new Error(`Missing frontmatter fields in ${relative(root, filePath)}: ${missing.join(", ")}`);
  }
};

const toPublicHref = filePath => `./${relative(publicDir, filePath).replaceAll("\\", "/")}`;

const createBaseItem = (filePath, pathAfterRoot) => {
  const extension = extname(filePath);
  const frontmatter = parseFrontmatter(filePath, extension === ".md");
  if (extension === ".md") {
    requireFields(frontmatter, ["title", "publishedAt", "updatedAt"], filePath);
  }

  const [sectorId, subsectorId] = pathAfterRoot;
  const stats = statSync(filePath);

  return {
    sectorId,
    subsectorId,
    title: frontmatter.title || pathAfterRoot.at(-1).replace(extension, ""),
    publishedAt: frontmatter.publishedAt || stats.birthtime.toISOString().slice(0, 10),
    updatedAt: frontmatter.updatedAt || stats.mtime.toISOString().slice(0, 10),
    format: frontmatter.format || formatByExtension[extension],
    file: pathAfterRoot.at(-1),
    href: toPublicHref(filePath)
  };
};

const buildCoreKnowledge = () => {
  const rootDir = join(publicDir, "core-knowledge");
  return listFiles(rootDir)
    .filter(filePath => supportedExtensions.has(extname(filePath)))
    .map(filePath => {
      const parts = relative(rootDir, filePath).replaceAll("\\", "/").split("/");
      return createBaseItem(filePath, parts);
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ko"));
};

const buildReports = () => {
  const rootDir = join(publicDir, "reports");
  return listFiles(rootDir)
    .filter(filePath => supportedExtensions.has(extname(filePath)))
    .filter(filePath => /^report\.(md|html|svg)$/.test(filePath.replaceAll("\\", "/").split("/").at(-1)))
    .map(filePath => {
      const parts = relative(rootDir, filePath).replaceAll("\\", "/").split("/");
      const item = createBaseItem(filePath, parts);
      const dataPath = join(filePath, "../data/metrics.json");
      if (!statSync(dataPath).isFile()) {
        throw new Error(`Missing report data: ${relative(root, dataPath)}`);
      }
      return {
        ...item,
        slug: parts[2],
        dataPath: toPublicHref(dataPath)
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
};

const manifest = {
  coreKnowledge: buildCoreKnowledge(),
  reports: buildReports()
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${relative(root, outputPath)}: ${manifest.coreKnowledge.length} core, ${manifest.reports.length} reports`);
