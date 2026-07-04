import {
  ArrowRightIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  RectangleStackIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const firstEnabledSector = sectors => sectors.sectors.find(sector => sector.enabled) || sectors.sectors[0];

const firstReport = sector => sector?.subsectors.flatMap(subsector =>
  (subsector.reports || []).map(report => ({ ...report, sector, subsector }))
)[0];

const firstCore = (sectors, sector) => (sectors.coreKnowledge || []).find(item => item.sectorId === sector?.id);

export const HomeView = ({ sectors, onSelectReport, onSelectDocument }) => {
  const sector = firstEnabledSector(sectors);
  const report = firstReport(sector);
  const core = firstCore(sectors, sector);

  return (
    <main className="workspace home-workspace" id="homeView">
      <header className="home-header">
        <p className="eyebrow">Investment Dashboard</p>
        <h1>시장 신호와 구조 지식을 함께 보는 투자 대시보드</h1>
        <p>
          AI 섹터를 시작점으로 보고서성 자료와 반복 참조할 개념 지식을 분리해 관리한다.
          대시보드에 포함되는 지표는 실제 공개 데이터와 출처가 확인되는 항목으로 제한한다.
        </p>
      </header>

      <section className="home-grid" aria-label="dashboard overview">
        <article className="home-card">
          <RectangleStackIcon aria-hidden="true" />
          <span>Structure</span>
          <h2>Sector 기반 탐색</h2>
          <p>AI를 시작 섹터로 두고, 개념과 보고서를 같은 탐색 구조에서 분리해 본다.</p>
        </article>
        <article className="home-card">
          <DocumentChartBarIcon aria-hidden="true" />
          <span>보고서</span>
          <h2>날짜가 있는 분석</h2>
          <p>시점 의존적인 데이터와 차트는 발행일이 있는 리포트로 관리한다.</p>
        </article>
        <article className="home-card">
          <CpuChipIcon aria-hidden="true" />
          <span>개념</span>
          <h2>반복 참조 지식</h2>
          <p>시간이 지나도 유효한 개념, 구조, 용어, 다이어그램은 개념 메뉴에 둔다.</p>
        </article>
        <article className="home-card">
          <ShieldCheckIcon aria-hidden="true" />
          <span>Data Policy</span>
          <h2>출처 기반</h2>
          <p>가정 데이터는 제외하고, 공개 출처가 확인되는 지표만 유지한다.</p>
        </article>
      </section>

      <section className="home-actions" aria-label="quick links">
        {report && (
          <button type="button" onClick={() => onSelectReport(report)}>
            <span>
              <strong>최근 리포트</strong>
              {report.title}
            </span>
            <ArrowRightIcon aria-hidden="true" />
          </button>
        )}
        {core && (
          <button type="button" onClick={() => onSelectDocument({ type: "core", item: core, sector })}>
            <span>
              <strong>개념</strong>
              {core.title}
            </span>
            <ArrowRightIcon aria-hidden="true" />
          </button>
        )}
      </section>
    </main>
  );
};
