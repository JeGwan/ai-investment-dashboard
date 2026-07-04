import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "./components/DashboardView.jsx";
import { DocumentViewer } from "./components/DocumentViewer.jsx";
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

const findInitialReport = sectors => {
  const sector = sectors.sectors.find(item => item.id === sectors.activeSectorId) || sectors.sectors[0];
  const subsector = sector.subsectors.find(item => item.id === sectors.activeSubsectorId) || sector.subsectors[0];
  const report = (subsector.reports || [])[0];
  return { type: "report", sector, subsector, report };
};

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

  useEffect(() => {
    Promise.all([
      fetchJson("data/sectors.json"),
      fetchJson("data/content-manifest.json")
    ])
      .then(([sectorSkeleton, manifest]) => {
        const nextSectors = hydrateSectors(sectorSkeleton, manifest);
        const initialSelection = findInitialReport(nextSectors);
        setSectors(nextSectors);
        setSelection(initialSelection);
      })
      .catch(error => setStatus({ loading: false, error: error.message }));
  }, []);

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

  const content = useMemo(() => {
    if (!sectors || !selection) {
      return <main className="workspace"><p className="document-state">대시보드를 불러오는 중</p></main>;
    }

    if (selection.type === "core") {
      return <DocumentViewer selection={selection} />;
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

  const handleSelectReport = item => {
    setSelection({ type: "report", sector: item.sector, subsector: item.subsector, report: item });
    setMobileMenuOpen(false);
  };

  const handleSelectDocument = nextSelection => {
    setSelection(nextSelection);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`app-layout${mobileMenuOpen ? " menu-open" : ""}`}>
      <header className="mobile-gnb">
        <div>
          <strong>SignalDesk</strong>
          <span>{selection.type === "core" ? "Core Knowledge" : "Reports"}</span>
        </div>
        <button type="button" aria-expanded={mobileMenuOpen ? "true" : "false"} onClick={() => setMobileMenuOpen(open => !open)}>
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </header>
      {mobileMenuOpen && <button className="menu-scrim" type="button" aria-label="close menu" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar
        sectors={sectors}
        selection={selection}
        onSelectReport={handleSelectReport}
        onSelectDocument={handleSelectDocument}
      />
      {content}
    </div>
  );
};
