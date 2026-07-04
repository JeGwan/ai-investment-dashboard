import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "./components/DashboardView.jsx";
import { DocumentViewer } from "./components/DocumentViewer.jsx";
import { HomeView } from "./components/HomeView.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { assetPath } from "./lib/paths.js";

const hydrateSectors = (sectors, manifest) => ({
  ...sectors,
  coreKnowledge: manifest.coreKnowledge,
  sectors: sectors.sectors.map(sector => ({
    ...sector,
    subsectors: sector.subsectors.map(subsector => ({
      ...subsector,
      reports: manifest.reports.filter(report =>
        report.sectorId === sector.id && report.subsectorId === subsector.id
      )
    }))
  }))
});

const fetchJson = async path => {
  const response = await fetch(assetPath(path));
  if (!response.ok) throw new Error(`데이터 로딩 실패: ${response.status}`);
  return response.json();
};

export const App = () => {
  const [sectors, setSectors] = useState(null);
  const [selection, setSelection] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("investment-dashboard-theme") || "light";
  });

  useEffect(() => {
    Promise.all([
      fetchJson("data/sectors.json"),
      fetchJson("data/content-manifest.json")
    ])
      .then(([sectorSkeleton, manifest]) => {
        const nextSectors = hydrateSectors(sectorSkeleton, manifest);
        setSectors(nextSectors);
        setSelection({ type: "home" });
      })
      .catch(error => setStatus({ loading: false, error: error.message }));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("investment-dashboard-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!selection || selection.type !== "report") return;

    let cancelled = false;
    setStatus({ loading: true, error: "" });
    fetchJson(selection.report.dataPath)
      .then(data => {
        if (cancelled) return;
        setReportData(data);
        setStatus({ loading: false, error: "" });
      })
      .catch(error => {
        if (!cancelled) setStatus({ loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [selection]);

  const handleSelectReport = item => {
    setSelection({ type: "report", sector: item.sector, subsector: item.subsector, report: item });
    setMobileMenuOpen(false);
  };

  const handleSelectDocument = nextSelection => {
    setSelection(nextSelection);
    setMobileMenuOpen(false);
  };

  const handleSelectHome = () => {
    setSelection({ type: "home" });
    setMobileMenuOpen(false);
  };

  const handleToggleTheme = () => {
    setTheme(current => current === "dark" ? "light" : "dark");
  };

  const content = useMemo(() => {
    if (!sectors || !selection) {
      return <main className="workspace"><p className="document-state">대시보드를 불러오는 중</p></main>;
    }

    if (selection.type === "core") {
      return <DocumentViewer selection={selection} />;
    }

    if (selection.type === "home") {
      return (
        <HomeView
          sectors={sectors}
          onSelectReport={handleSelectReport}
          onSelectDocument={handleSelectDocument}
        />
      );
    }

    if (status.error) {
      return <main className="workspace"><p className="document-state error">{status.error}</p></main>;
    }

    if (status.loading || !reportData) {
      return <main className="workspace" id="dashboardView"><p className="document-state">리포트 데이터를 불러오는 중</p></main>;
    }

    return (
      <DashboardView
        data={reportData}
        sector={selection.sector}
        subsector={selection.subsector}
        report={selection.report}
      />
    );
  }, [reportData, sectors, selection, status]);

  if (!sectors || !selection) {
    return <div className="app-layout">{content}</div>;
  }

  return (
    <div className={`app-layout${mobileMenuOpen ? " menu-open" : ""}`}>
      <header className="mobile-gnb">
        <div>
          <strong>investors</strong>
          <span>{selection.type === "home" ? "홈" : selection.type === "core" ? "개념" : "보고서"}</span>
        </div>
        <button type="button" aria-expanded={mobileMenuOpen ? "true" : "false"} onClick={() => setMobileMenuOpen(open => !open)}>
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </header>
      {mobileMenuOpen && <button className="menu-scrim" type="button" aria-label="close menu" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar
        sectors={sectors}
        selection={selection}
        theme={theme}
        onSelectHome={handleSelectHome}
        onToggleTheme={handleToggleTheme}
        onSelectReport={handleSelectReport}
        onSelectDocument={handleSelectDocument}
      />
      {content}
    </div>
  );
};
