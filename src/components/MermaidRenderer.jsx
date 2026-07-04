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

export const renderMermaidDiagrams = async root => {
  if (!root) return;

  const codeBlocks = Array.from(root.querySelectorAll("pre > code.language-mermaid, code.language-mermaid"));
  if (codeBlocks.length === 0) return;

  const mermaid = await loadMermaid();
  const nodes = codeBlocks.map((code, index) => {
    const container = document.createElement("div");
    container.className = "mermaid";
    container.dataset.processed = "false";
    container.id = `mermaid-${Date.now()}-${index}`;
    container.textContent = code.textContent;

    const parent = code.parentElement?.tagName === "PRE" ? code.parentElement : code;
    parent.replaceWith(container);
    return container;
  });

  await mermaid.run({ nodes });
};
