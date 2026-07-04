const palette = ["#2878c8", "#0f8b5f", "#a96f00", "#c23b3b", "#5f5aa2"];

const state = {
  data: null,
  sectors: null,
  selectedId: null,
  normalized: false
};

const formatNumber = (value, maxDigits = 1) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits
  }).format(value);
};

const formatValue = (value, indicator) => {
  if (indicator.format === "currencyDecimal") return `$${formatNumber(value, 3)}B`;
  if (indicator.format === "krwTrillion") return `${formatNumber(value, 3)}조원`;
  if (indicator.format === "index") return formatNumber(value, 1);
  if (indicator.format === "currency") return `$${Math.round(value)}B`;
  if (indicator.format === "percent") return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
};

const formatDeltaValue = (value, indicator) => {
  const absolute = Math.abs(value);
  if (indicator.format === "currencyDecimal") return `$${formatNumber(absolute, 3)}B`;
  if (indicator.format === "krwTrillion") return `${formatNumber(absolute, 3)}조원`;
  if (indicator.format === "index") return `${formatNumber(absolute, 1)}p`;
  if (indicator.format === "currency") return `$${formatNumber(absolute, 1)}B`;
  if (indicator.format === "percent") return `${formatNumber(absolute, 1)}pt`;
  return formatNumber(absolute, 1);
};

const trendInfo = indicator => {
  const values = indicator.series[0].values;
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const percent = first === 0 ? null : (delta / first) * 100;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const direction = delta > 0 ? "상승" : delta < 0 ? "하락" : "변화 없음";

  return {
    delta,
    percent,
    direction,
    deltaLabel: `${indicator.labels[0]} 이후 ${sign}${formatDeltaValue(delta, indicator)}`,
    percentLabel: percent === null ? "" : `${sign}${formatNumber(Math.abs(percent), 1)}%`
  };
};

const normalizeValues = values => {
  const base = values[0] || 1;
  return values.map(value => (value / base) * 100);
};

const indicatorById = id => state.data.indicators.find(indicator => indicator.id === id);

const activeSector = () => state.sectors.sectors.find(sector => sector.id === state.sectors.activeSectorId);

const activeSubsector = () => {
  const sector = activeSector();
  return sector.subsectors.find(subsector => subsector.id === state.sectors.activeSubsectorId);
};

const getPlotSeries = indicator => {
  return indicator.series.map(series => ({
    label: series.label,
    values: state.normalized ? normalizeValues(series.values) : series.values
  }));
};

const escapeHtml = value => {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
};

const resizeCanvas = canvas => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(180, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
};

const drawChart = (canvas, indicator, options = {}) => {
  const { ctx, width, height } = resizeCanvas(canvas);
  const labels = indicator.labels;
  const series = getPlotSeries(indicator);
  const padding = options.mini
    ? { top: 14, right: 12, bottom: 22, left: 30 }
    : { top: 26, right: 34, bottom: 46, left: 58 };

  ctx.clearRect(0, 0, width, height);

  const allValues = series.flatMap(item => item.values);
  const minRaw = Math.min(...allValues);
  const maxRaw = Math.max(...allValues);
  const spread = Math.max(1, maxRaw - minRaw);
  const yMin = minRaw - spread * 0.12;
  const yMax = maxRaw + spread * 0.12;

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const xFor = index => padding.left + (plotW * index) / Math.max(1, labels.length - 1);
  const yFor = value => padding.top + ((yMax - value) / (yMax - yMin)) * plotH;

  ctx.strokeStyle = "#e6ebf0";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#66717d";
  ctx.font = options.mini ? "10px system-ui" : "12px system-ui";

  const gridCount = options.mini ? 3 : 5;
  for (let i = 0; i <= gridCount; i += 1) {
    const y = padding.top + (plotH * i) / gridCount;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    if (!options.mini) {
      const value = yMax - ((yMax - yMin) * i) / gridCount;
      ctx.fillText(formatNumber(value, 1), 12, y + 4);
    }
  }

  if (!options.mini) {
    const labelStep = Math.max(1, Math.ceil(labels.length / 7));
    labels.forEach((label, index) => {
      if (index % labelStep === 0 || index === labels.length - 1) {
        ctx.fillText(label, xFor(index) - 20, height - 16);
      }
    });
  } else {
    ctx.fillText(labels[0], padding.left - 12, height - 8);
    ctx.fillText(labels[labels.length - 1], width - padding.right - 38, height - 8);
  }

  series.forEach((item, seriesIndex) => {
    ctx.strokeStyle = palette[seriesIndex % palette.length];
    ctx.lineWidth = options.mini ? 2 : 3;
    ctx.beginPath();

    item.values.forEach((value, index) => {
      const x = xFor(index);
      const y = yFor(value);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    item.values.forEach((value, index) => {
      const x = xFor(index);
      const y = yFor(value);
      ctx.fillStyle = palette[seriesIndex % palette.length];
      ctx.beginPath();
      ctx.arc(x, y, options.mini ? 2.5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  if (!options.mini && series.length > 1) {
    series.forEach((item, index) => {
      ctx.fillStyle = palette[index % palette.length];
      ctx.fillRect(width - 210, 18 + index * 20, 10, 10);
      ctx.fillStyle = "#26313c";
      ctx.fillText(item.label, width - 194, 28 + index * 20);
    });
  }
};

const renderTabs = () => {
  const tabs = document.getElementById("indicatorTabs");
  tabs.innerHTML = "";

  state.data.indicators.forEach(indicator => {
    const button = document.createElement("button");
    button.className = "tab-button";
    button.type = "button";
    button.role = "tab";
    button.textContent = indicator.shortName;
    button.setAttribute("aria-selected", indicator.id === state.selectedId ? "true" : "false");
    button.addEventListener("click", () => {
      state.selectedId = indicator.id;
      render();
    });
    tabs.appendChild(button);
  });
};

const renderSectorNav = () => {
  const nav = document.getElementById("sectorNav");
  nav.innerHTML = "";

  state.sectors.sectors.forEach(sector => {
    const group = document.createElement("section");
    group.className = `nav-group${sector.enabled ? "" : " disabled"}`;

    const heading = document.createElement("div");
    heading.className = "nav-heading";
    heading.innerHTML = `
      <span>${sector.enabled ? "Sector" : "Planned Sector"}</span>
      <strong>${escapeHtml(sector.name)}</strong>
    `;
    group.appendChild(heading);

    sector.subsectors.forEach(subsector => {
      const link = document.createElement(subsector.enabled ? "a" : "span");
      const active = sector.id === state.sectors.activeSectorId && subsector.id === state.sectors.activeSubsectorId;
      link.className = `nav-link${active ? " active" : ""}${subsector.enabled ? "" : " disabled"}`;
      if (subsector.enabled) {
        link.href = subsector.href || "#";
        if (active) link.setAttribute("aria-current", "page");
      } else {
        link.setAttribute("aria-disabled", "true");
      }
      link.innerHTML = `
        <span class="nav-dot"></span>
        ${escapeHtml(subsector.name)}
      `;
      group.appendChild(link);
    });

    nav.appendChild(group);
  });
};

const renderDocuments = () => {
  const reports = activeSubsector().documents || [];
  const reportContainer = document.getElementById("sectorDocs");
  const knowledge = state.sectors.coreKnowledge
    .filter(item => item.sectorId === state.sectors.activeSectorId)
    .filter(item => !item.subsectorId || item.subsectorId === state.sectors.activeSubsectorId);
  const knowledgeContainer = document.getElementById("coreKnowledge");

  document.getElementById("documentCount").textContent = reports.length;
  reportContainer.innerHTML = reports.map(item => `
    <a class="document-link" href="${escapeHtml(item.href)}">
      <span>${escapeHtml(item.date)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <code>${escapeHtml(item.file)}</code>
    </a>
  `).join("");

  document.getElementById("knowledgeCount").textContent = knowledge.length;
  knowledgeContainer.innerHTML = knowledge.map(item => `
    <a class="document-link core" href="${escapeHtml(item.href)}">
      <span>Core</span>
      <strong>${escapeHtml(item.title)}</strong>
      <code>${escapeHtml(item.file)}</code>
    </a>
  `).join("");
};

const renderKpis = () => {
  const grid = document.getElementById("summaryGrid");
  grid.innerHTML = "";

  state.data.indicators.forEach((indicator, index) => {
    const values = indicator.series[0].values;
    const trend = trendInfo(indicator);
    const card = document.createElement("article");
    card.className = "metric-card";
    card.style.borderTopColor = palette[index % palette.length];
    card.innerHTML = `
      <span class="metric-label">${escapeHtml(indicator.shortName)}</span>
      <strong>${formatValue(values.at(-1), indicator)}</strong>
      <span>${escapeHtml(trend.deltaLabel)} ${escapeHtml(trend.percentLabel)}</span>
    `;
    grid.appendChild(card);
  });

  const excludedCard = document.createElement("article");
  excludedCard.className = "metric-card";
  excludedCard.style.borderTopColor = "#c23b3b";
  excludedCard.innerHTML = `
    <span class="metric-label">제외 지표</span>
    <strong>${state.data.excludedIndicators.length}</strong>
    <span>공개 원천 시계열 미확인</span>
  `;
  grid.appendChild(excludedCard);
};

const renderFocus = () => {
  const indicator = indicatorById(state.selectedId);
  const sources = indicator.sources || [];
  const trend = trendInfo(indicator);

  document.getElementById("focusTitle").textContent = indicator.name;
  document.getElementById("focusSignal").textContent = `${trend.direction} ${trend.percentLabel}`;
  document.getElementById("focusDescription").textContent = indicator.whyItMatters;
  document.getElementById("focusRead").textContent = indicator.semiconductorRead;
  document.getElementById("focusSources").innerHTML = sources.map(source => `
    <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(source.label)}</strong>
      <span>${escapeHtml(source.note)}</span>
    </a>
  `).join("");

  drawChart(document.getElementById("focusChart"), indicator);
};

const renderSmallMultiples = () => {
  const container = document.getElementById("smallMultiples");
  container.innerHTML = "";

  state.data.indicators.forEach(indicator => {
    const card = document.createElement("article");
    card.className = "mini-card";
    card.innerHTML = `
      <h3>${indicator.shortName}</h3>
      <div class="mini-chart"><canvas aria-label="${indicator.name} mini chart"></canvas></div>
      <div class="mini-meta">
        <span>${formatValue(indicator.series[0].values[0], indicator)}</span>
        <strong>${formatValue(indicator.series[0].values.at(-1), indicator)}</strong>
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedId = indicator.id;
      render();
      document.querySelector(".chart-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    container.appendChild(card);
    drawChart(card.querySelector("canvas"), indicator, { mini: true });
  });
};

const renderExcludedIndicators = () => {
  const container = document.getElementById("excludedIndicators");
  container.innerHTML = "";

  state.data.excludedIndicators.forEach(item => {
    const row = document.createElement("div");
    row.className = "excluded-row";
    row.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.reason)}</span>
    `;
    container.appendChild(row);
  });
};

const render = () => {
  document.getElementById("updatedAt").textContent = `업데이트 ${state.data.updatedAt} · 실제 공개 데이터`;
  document.getElementById("dataNote").textContent = state.data.note;
  document.getElementById("workspacePath").textContent = `${activeSector().name} Sector / ${activeSubsector().name}`;
  document.getElementById("normalizeToggle").checked = state.normalized;
  document.getElementById("indicatorCount").textContent = state.data.indicators.length;
  document.getElementById("sourceCount").textContent = state.data.indicators
    .reduce((total, indicator) => total + (indicator.sources || []).length, 0);
  renderSectorNav();
  renderDocuments();
  renderTabs();
  renderKpis();
  renderFocus();
  renderSmallMultiples();
  renderExcludedIndicators();
};

const boot = async () => {
  const [metricsResponse, sectorsResponse] = await Promise.all([
    fetch("./data/metrics.json"),
    fetch("./data/sectors.json")
  ]);
  state.data = await metricsResponse.json();
  state.sectors = await sectorsResponse.json();
  state.selectedId = state.data.indicators[0].id;

  document.getElementById("normalizeToggle").addEventListener("change", event => {
    state.normalized = event.target.checked;
    render();
  });

  window.addEventListener("resize", () => render());
  render();
};

boot().catch(error => {
  document.body.innerHTML = `<main class="workspace"><h1>데이터 로딩 실패</h1><p>${error.message}</p></main>`;
});
