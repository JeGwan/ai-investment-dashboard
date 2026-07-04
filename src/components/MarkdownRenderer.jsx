import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";
import { stripFrontmatter } from "../lib/documents.js";
import { MermaidRenderer } from "./MermaidRenderer.jsx";

const mermaidFencePattern = /```mermaid\s*\n([\s\S]*?)```/g;

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isRelativeUrl = value => {
  if (!value) return false;
  return !/^(?:[a-z]+:|#|\/)/i.test(value);
};

const rewriteRelativeUrls = (html, basePath) => {
  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("[src]").forEach(node => {
    const value = node.getAttribute("src");
    if (isRelativeUrl(value)) node.setAttribute("src", new URL(value, window.location.origin + basePath).href);
  });

  template.content.querySelectorAll("[href]").forEach(node => {
    const value = node.getAttribute("href");
    if (isRelativeUrl(value)) node.setAttribute("href", new URL(value, window.location.origin + basePath).href);
  });

  return template.innerHTML;
};

export const renderMarkdownDocument = (markdown, basePath) => {
  const rawHtml = marked.parse(markdown, {
    async: false,
    gfm: true
  });
  const sanitized = DOMPurify.sanitize(rawHtml);
  return rewriteRelativeUrls(sanitized, basePath);
};

export const stripLeadingTitle = (markdown, documentTitle = "") => {
  const body = stripFrontmatter(markdown).trimStart();
  if (!documentTitle) return body;

  const titlePattern = new RegExp(`^#\\s+${escapeRegExp(documentTitle)}\\s*(?:\\n|$)`);
  return body.replace(titlePattern, "").trimStart();
};

export const splitMarkdownDocument = (markdown, documentTitle = "") => {
  const body = stripLeadingTitle(markdown, documentTitle);
  const blocks = [];
  let cursor = 0;
  let match;

  while ((match = mermaidFencePattern.exec(body)) !== null) {
    if (match.index > cursor) {
      blocks.push({ type: "markdown", content: body.slice(cursor, match.index) });
    }
    blocks.push({ type: "mermaid", content: match[1].trim() });
    cursor = match.index + match[0].length;
  }

  if (cursor < body.length) {
    blocks.push({ type: "markdown", content: body.slice(cursor) });
  }

  return blocks.filter(block => block.content.trim().length > 0);
};

export const MarkdownRenderer = ({ content, basePath, documentTitle = "" }) => {
  const blocks = useMemo(() => splitMarkdownDocument(content, documentTitle), [content, documentTitle]);

  return (
    <div className="document-body markdown-body">
      {blocks.map((block, index) => {
        if (block.type === "mermaid") {
          return <MermaidRenderer source={block.content} key={`${block.type}-${index}`} />;
        }

        return (
          <div
            className="markdown-section"
            dangerouslySetInnerHTML={{ __html: renderMarkdownDocument(block.content, basePath) }}
            key={`${block.type}-${index}`}
          />
        );
      })}
    </div>
  );
};
