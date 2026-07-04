export const detectDocumentFormat = item => {
  if (item.format) return item.format;
  if (item.href.endsWith(".html")) return "html";
  if (item.href.endsWith(".svg")) return "svg";
  return "markdown";
};

export const stripFrontmatter = text => text.replace(/^---[\s\S]*?---\s*/, "");
