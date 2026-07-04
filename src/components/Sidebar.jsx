import { useMemo, useState } from "react";

const toggleSet = (set, value) => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

const FolderButton = ({ expanded, label, count, onClick }) => (
  <button className="tree-folder" type="button" aria-expanded={expanded ? "true" : "false"} onClick={onClick}>
    <span className="nav-chevron" aria-hidden="true" />
    <span>{label}</span>
    <strong>{count}</strong>
  </button>
);

const documentMeta = item => {
  if (!item.publishedAt) return "";
  if (item.updatedAt && item.updatedAt !== item.publishedAt) return `${item.publishedAt} · 수정 ${item.updatedAt}`;
  return item.publishedAt;
};

export const Sidebar = ({ sectors, selection, onSelectReport, onSelectDocument }) => {
  const [expandedSectors, setExpandedSectors] = useState(() => new Set([sectors.activeSectorId]));
  const [expandedFolders, setExpandedFolders] = useState(() => new Set([
    `${sectors.activeSectorId}:core`,
    `${sectors.activeSectorId}:reports`
  ]));

  const coreBySector = useMemo(() => {
    return (sectors.coreKnowledge || []).reduce((map, item) => {
      const list = map.get(item.sectorId) || [];
      list.push(item);
      map.set(item.sectorId, list);
      return map;
    }, new Map());
  }, [sectors.coreKnowledge]);

  return (
    <aside className="sidebar" aria-label="dashboard navigation">
      <div className="brand-block">
        <div>
          <strong>SignalDesk</strong>
          <span>AI Investment Dashboard</span>
        </div>
      </div>

      <div className="nav-title">Sector</div>
      <nav className="sector-nav" id="sectorNav" aria-label="sector navigation">
        {sectors.sectors.map(sector => {
          const sectorExpanded = expandedSectors.has(sector.id);
          const coreItems = coreBySector.get(sector.id) || [];
          const reportItems = sector.subsectors.flatMap(subsector =>
            (subsector.reports || []).map(report => ({ ...report, sector, subsector }))
          );
          const coreKey = `${sector.id}:core`;
          const reportsKey = `${sector.id}:reports`;
          const coreExpanded = expandedFolders.has(coreKey);
          const reportsExpanded = expandedFolders.has(reportsKey);

          return (
            <section className={`nav-group${sector.enabled ? "" : " disabled"}${sectorExpanded ? " expanded" : ""}`} key={sector.id}>
              <button
                className="nav-trigger"
                type="button"
                aria-expanded={sectorExpanded ? "true" : "false"}
                onClick={() => setExpandedSectors(current => toggleSet(current, sector.id))}
              >
                <span className="nav-trigger-text">
                  <strong>{sector.name}</strong>
                </span>
                <span className="nav-chevron" aria-hidden="true" />
              </button>

              {sectorExpanded && (
                <div className="nav-panel">
                  <FolderButton
                    expanded={coreExpanded}
                    label="Core Knowledge"
                    count={coreItems.length}
                    onClick={() => setExpandedFolders(current => toggleSet(current, coreKey))}
                  />
                  {coreExpanded && (
                    <div className="tree-children">
                      {coreItems.length === 0 && <span className="nav-empty">준비 중</span>}
                      {coreItems.map(item => (
                        <button
                          className={`tree-item${selection.type === "core" && selection.item.href === item.href ? " active" : ""}`}
                          type="button"
                          key={item.href}
                          onClick={() => onSelectDocument({ type: "core", item, sector })}
                        >
                          <span>{item.title}</span>
                          {documentMeta(item) && <small>{documentMeta(item)}</small>}
                        </button>
                      ))}
                    </div>
                  )}

                  <FolderButton
                    expanded={reportsExpanded}
                    label="Reports"
                    count={reportItems.length}
                    onClick={() => setExpandedFolders(current => toggleSet(current, reportsKey))}
                  />
                  {reportsExpanded && (
                    <div className="tree-children">
                      {reportItems.length === 0 && <span className="nav-empty">준비 중</span>}
                      {reportItems.map(item => (
                        <button
                          className={`tree-item${selection.type === "report" && selection.report.href === item.href ? " active" : ""}`}
                          type="button"
                          key={item.href}
                          onClick={() => onSelectReport(item)}
                        >
                          <span>{item.title}</span>
                          <small>{item.publishedAt} · {item.subsector.name}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <span>Scope</span>
        <p>실제 공개 데이터가 있는 지표만 포함한다.</p>
      </div>
    </aside>
  );
};
