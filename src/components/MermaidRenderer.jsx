import DOMPurify from "dompurify";
import { useEffect, useId, useState } from "react";

let initialized = false;

const loadMermaid = async () => {
  const module = await import("mermaid");
  const mermaid = module.default;
  if (initialized) return mermaid;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      primaryColor: "#eef6ff",
      primaryTextColor: "#26313c",
      primaryBorderColor: "#9bbfdf",
      lineColor: "#65717f",
      secondaryColor: "#f3f7f4",
      tertiaryColor: "#ffffff"
    }
  });
  initialized = true;
  return mermaid;
};

export const renderMermaidDiagram = async (id, source) => {
  const mermaid = await loadMermaid();
  const result = await mermaid.render(id, source);
  return DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true } });
};

export const MermaidRenderer = ({ source }) => {
  const reactId = useId().replaceAll(":", "");
  const [state, setState] = useState({ status: "loading", svg: "", error: "" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", svg: "", error: "" });

    renderMermaidDiagram(`mermaid-${reactId}`, source)
      .then(svg => {
        if (!cancelled) setState({ status: "ready", svg, error: "" });
      })
      .catch(error => {
        if (!cancelled) setState({ status: "error", svg: "", error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [reactId, source]);

  if (state.status === "loading") {
    return <div className="mermaid mermaid-loading">Mermaid 렌더링 중</div>;
  }

  if (state.status === "error") {
    return (
      <div className="mermaid mermaid-error">
        <strong>Mermaid 렌더링 실패</strong>
        <pre>{source}</pre>
        <p>{state.error}</p>
      </div>
    );
  }

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: state.svg }} />;
};
