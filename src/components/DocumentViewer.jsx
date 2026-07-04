import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { detectDocumentFormat } from "../lib/documents.js";
import { assetPath, documentBasePath } from "../lib/paths.js";
import { MarkdownRenderer } from "./MarkdownRenderer.jsx";

const InlineHtml = ({ content, format }) => {
  const html = useMemo(() => {
    if (format === "svg") {
      return DOMPurify.sanitize(content, { USE_PROFILES: { svg: true, svgFilters: true } });
    }
    return DOMPurify.sanitize(content);
  }, [content, format]);

  return <div className={`document-body ${format}-body`} dangerouslySetInnerHTML={{ __html: html }} />;
};

export const DocumentViewer = ({ selection }) => {
  const [state, setState] = useState({ status: "loading", content: "", error: "" });
  const item = selection.item;
  const format = detectDocumentFormat(item);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", content: "", error: "" });

    fetch(assetPath(item.href))
      .then(response => {
        if (!response.ok) throw new Error(`문서 로딩 실패: ${response.status}`);
        return response.text();
      })
      .then(content => {
        if (!cancelled) setState({ status: "ready", content, error: "" });
      })
      .catch(error => {
        if (!cancelled) setState({ status: "error", content: "", error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [item.href]);

  return (
    <main className="workspace document-workspace" id="documentViewer">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {selection.sector.name} Sector / {selection.type === "core" ? "Core Knowledge" : "Report"}
          </p>
          <h1>{item.title}</h1>
        </div>
        <div className="status-panel" aria-label="document format">
          <span className="status-dot" />
          <span>{format.toUpperCase()} 렌더링</span>
        </div>
      </header>

      <article className="document-panel">
        {state.status === "loading" && <p className="document-state">문서를 불러오는 중</p>}
        {state.status === "error" && <p className="document-state error">{state.error}</p>}
        {state.status === "ready" && format === "markdown" && (
          <MarkdownRenderer content={state.content} basePath={documentBasePath(item.href)} />
        )}
        {state.status === "ready" && format !== "markdown" && <InlineHtml content={state.content} format={format} />}
      </article>
    </main>
  );
};
