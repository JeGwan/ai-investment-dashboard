import DOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useMemo, useRef } from "react";
import { stripFrontmatter } from "../lib/documents.js";
import { renderMermaidDiagrams } from "./MermaidRenderer.jsx";

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
  const rawHtml = marked.parse(stripFrontmatter(markdown), {
    async: false,
    gfm: true
  });
  const sanitized = DOMPurify.sanitize(rawHtml);
  return rewriteRelativeUrls(sanitized, basePath);
};

export const MarkdownRenderer = ({ content, basePath }) => {
  const ref = useRef(null);
  const html = useMemo(() => renderMarkdownDocument(content, basePath), [content, basePath]);

  useEffect(() => {
    renderMermaidDiagrams(ref.current).catch(error => {
      console.error("Mermaid rendering failed", error);
    });
  }, [html]);

  return <div ref={ref} className="document-body markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
};
