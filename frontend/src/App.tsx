import React, { useState, useEffect, useCallback } from "react";
import { getLeads, trackEvent, type Lead } from "./services/api";
import LeadTable from "./components/LeadTable";
import ChartsView from "./components/LeadChart";
import Filters from "./components/Filters";
import StatCard from "./components/StatCard";
import "./App.css";

type ViewMode = "table" | "charts";

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [enrichLeads, setEnrichLeads] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    industry: string;
    size: { min: number | string; max: number | string };
  }>({
    industry: "",
    size: { min: 0, max: 1000 },
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response = await getLeads({
        enrich: enrichLeads,
        industry: filters.industry || undefined,
        sizeMin: Number(filters.size.min) || 0,
        sizeMax: Number(filters.size.max) || 10000,
      });
      setLeads(response.data);
    } catch (err) {
      setError("Failed to fetch leads. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  }, [filters, enrichLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    trackEvent("filter", {
      filterType: Object.keys(newFilters)[0],
      value: Object.values(newFilters)[0],
    });
  };

  const handleViewToggle = (mode: ViewMode) => {
    setViewMode(mode);
    trackEvent("toggle_view", { view: mode });
  };

  const handleRefresh = () => {
    fetchLeads();
    trackEvent("refresh", {});
  };

  const totalLeads = leads.length;
  const averageSize =
    leads.length > 0
      ? Math.round(
          leads.reduce((acc, lead) => acc + lead.size, 0) / leads.length
        )
      : 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ width: "150px" }}></div> {/* Spacer */}
        <h1 className="gradient-text">Lead Dashboard</h1>
        <div className="view-toggle">
          <button
            onClick={() => handleViewToggle("table")}
            disabled={viewMode === "table"}
          >
            Table
          </button>
          <button
            onClick={() => handleViewToggle("charts")}
            disabled={viewMode === "charts"}
          >
            Charts
          </button>
        </div>
      </header>

      <div className="controls-container">
        <div className="filters-wrapper card-style">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            uniqueIndustries={[
              "Technology",
              "Manufacturing",
              "Healthcare",
              "Finance",
              "Retail",
              "Social",
            ]}
          />
        </div>
        <div className="actions-wrapper">
          <div className="enrich-toggle card-style">
            <label htmlFor="enrich-switch">Enrich with AI</label>
            <label className="switch">
              <input
                id="enrich-switch"
                type="checkbox"
                checked={enrichLeads}
                onChange={(e) => setEnrichLeads(e.target.checked)}
              />
              <span className="slider-switch"></span>
            </label>
          </div>
          <button
            onClick={handleRefresh}
            className="refresh-btn card-style"
            title="Refresh Data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="main-content-grid">
        <div className="content-view card-style">
          {error && <p className="error">{error}</p>}
          {viewMode === "table" ? (
            <LeadTable
              leads={leads}
              loading={loading}
              isEnriched={enrichLeads}
            />
          ) : loading ? (
            <p style={{ textAlign: "center", alignSelf: "center" }}>
              Loading chart data...
            </p>
          ) : (
            <ChartsView leads={leads} />
          )}
        </div>
        <div className="sidebar">
          <StatCard
            title="Total Leads"
            value={totalLeads.toString()}
            loading={loading}
          />
          <StatCard
            title="Average Company Size"
            value={averageSize.toString()}
            loading={loading}
          />
        </div>
      </div>

      <footer className="app-footer">End</footer>
    </div>
  );
};

export default App;
