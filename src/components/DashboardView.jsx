import { useEffect, useMemo, useRef, useState } from "react";
import { drawChart, palette } from "../lib/charting.js";
import { formatValue, trendInfo } from "../lib/formatters.js";

const ChartCanvas = ({ indicator, normalized, mini = false }) => {
  const ref = useRef(null);

  useEffect(() => {
    drawChart(ref.current, indicator, { normalized, mini });
  }, [indicator, normalized, mini]);

  return <canvas ref={ref} aria-label={`${indicator.name} chart`} />;
};

const MetricCard = ({ indicator, index }) => {
  const values = indicator.series[0].values;
  const trend = trendInfo(indicator);

  return (
    <article className="metric-card" style={{ borderTopColor: palette[index % palette.length] }}>
      <span className="metric-label">{indicator.shortName}</span>
      <strong>{formatValue(values.at(-1), indicator)}</strong>
      <span>
        {trend.deltaLabel} {trend.percentLabel}
      </span>
    </article>
  );
};

const SourceList = ({ sources }) => (
  <div className="source-list">
    {sources.map(source => (
      <a className="source-link" href={source.url} target="_blank" rel="noreferrer" key={source.url}>
        <strong>{source.label}</strong>
        <span>{source.note}</span>
      </a>
    ))}
  </div>
);

const MiniCard = ({ indicator, normalized, onSelect }) => (
  <article className="mini-card" onClick={onSelect}>
    <h3>{indicator.shortName}</h3>
    <div className="mini-chart">
      <ChartCanvas indicator={indicator} normalized={normalized} mini />
    </div>
    <div className="mini-meta">
      <span>{formatValue(indicator.series[0].values[0], indicator)}</span>
      <strong>{formatValue(indicator.series[0].values.at(-1), indicator)}</strong>
    </div>
  </article>
);

export const DashboardView = ({ data, sector, subsector, report }) => {
  const [selectedId, setSelectedId] = useState(data.indicators[0].id);
  const [normalized, setNormalized] = useState(false);
  const selected = useMemo(
    () => data.indicators.find(indicator => indicator.id === selectedId) || data.indicators[0],
    [data.indicators, selectedId]
  );
  const selectedTrend = trendInfo(selected);
  const sourceCount = data.indicators.reduce((total, indicator) => total + (indicator.sources || []).length, 0);

  useEffect(() => {
    setSelectedId(data.indicators[0].id);
    setNormalized(false);
  }, [data]);

  return (
    <main className="workspace" id="dashboardView">
      <header className="topbar">
        <div>
          <p className="eyebrow" id="workspacePath">
            {sector.name} Sector / {subsector.name}
          </p>
          <h1>AI 반도체 투자 대시보드</h1>
        </div>
        <div className="status-panel" aria-label="data status">
          <span className="status-dot" />
          <span>업데이트 {data.updatedAt} · 실제 공개 데이터</span>
        </div>
      </header>

      <section className="section-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Report</p>
            <h2>{report.title}</h2>
          </div>
          <div className="dashboard-stats" aria-label="dashboard stats">
            <span>
              <strong>{data.indicators.length}</strong> 지표
            </span>
            <span>
              <strong>{sourceCount}</strong> 출처
            </span>
          </div>
        </div>
        <div className="summary-grid" aria-label="market summary">
          {data.indicators.map((indicator, index) => (
            <MetricCard indicator={indicator} index={index} key={indicator.id} />
          ))}
          <article className="metric-card" style={{ borderTopColor: "#c23b3b" }}>
            <span className="metric-label">제외 지표</span>
            <strong>{data.excludedIndicators.length}</strong>
            <span>공개 원천 시계열 미확인</span>
          </article>
        </div>
      </section>

      <section className="control-strip" aria-label="dashboard controls">
        <div className="segmented" role="tablist" aria-label="indicator selector">
          {data.indicators.map(indicator => (
            <button
              className="tab-button"
              type="button"
              role="tab"
              aria-selected={indicator.id === selected.id ? "true" : "false"}
              key={indicator.id}
              onClick={() => setSelectedId(indicator.id)}
            >
              {indicator.shortName}
            </button>
          ))}
        </div>
        <label className="toggle-row">
          <input type="checkbox" checked={normalized} onChange={event => setNormalized(event.target.checked)} />
          <span>100 기준 정규화</span>
        </label>
      </section>

      <section className="focus-layout">
        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Selected signal</p>
              <h2>{selected.name}</h2>
            </div>
            <span className="signal-pill">
              {selectedTrend.direction} {selectedTrend.percentLabel}
            </span>
          </div>
          <div className="chart-frame">
            <ChartCanvas indicator={selected} normalized={normalized} />
          </div>
          <div className="chart-meta">
            <p>{selected.whyItMatters}</p>
            <p>{selected.semiconductorRead}</p>
          </div>
          <div className="source-panel">
            <h3>원천 출처</h3>
            <SourceList sources={selected.sources || []} />
          </div>
        </article>

        <aside className="read-panel">
          <h2>데이터 원칙</h2>
          <div className="rule-list">
            <div>
              <span className="rule-label">실제값만</span>
              <p>공식 IR, 실적발표, 공공 통계, 방법론이 공개된 지표만 사용한다.</p>
            </div>
            <div>
              <span className="rule-label">추정 제외</span>
              <p>보간, 내부 가정, 임의 지수, 민감도 점수는 만들지 않는다.</p>
            </div>
            <div>
              <span className="rule-label">원천 미확인 제외</span>
              <p>공개 시계열 원천을 확인하지 못한 지표는 화면에 포함하지 않는다.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="small-multiple-grid" aria-label="all indicator charts">
        {data.indicators.map(indicator => (
          <MiniCard
            indicator={indicator}
            normalized={normalized}
            key={indicator.id}
            onSelect={() => {
              setSelectedId(indicator.id);
              document.querySelector(".chart-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        ))}
      </section>

      <section className="exposure-section">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Excluded</p>
            <h2>공개 시계열을 확인하지 못한 항목</h2>
          </div>
        </div>
        <div className="excluded-list">
          {data.excludedIndicators.map(item => (
            <div className="excluded-row" key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.reason}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="footnote">
        <p>{data.note}</p>
        <p>투자 조언이 아니라 실제 공개 데이터 관찰용 대시보드다.</p>
      </footer>
    </main>
  );
};
