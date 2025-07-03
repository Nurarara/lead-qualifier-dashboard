import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// --- Inlined Dependencies ---

// 1. Inlined Type Definition
export interface Lead {
  id: number;
  name: string;
  company: string;
  industry: string;
  size: number;
  source: string;
  created_at: string;
  quality?: string;
  summary?: string;
}

// 2. Inlined API Service
const API_BASE_URL = "http://localhost:8000";
const apiClient = axios.create({ baseURL: API_BASE_URL });

const getLeads = (params: {
  enrich: boolean;
  industry?: string;
  sizeMin?: number;
  sizeMax?: number;
}) => {
  return apiClient.get<Lead[]>("/api/leads", { params });
};

const trackEvent = (action: string, metadata: Record<string, any>) => {
  return apiClient.post("/api/events", {
    action,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// 3. Inlined Components

const Filters: React.FC<{
  filters: {
    industry: string;
    size: { min: number | string; max: number | string };
  };
  onFilterChange: (
    newFilters: Partial<{
      industry: string;
      size: { min: number | string; max: number | string };
    }>
  ) => void;
  uniqueIndustries: string[];
}> = ({ filters, onFilterChange, uniqueIndustries }) => {
  const handleSizeChange = (field: "min" | "max", value: string) => {
    const newSize = {
      ...filters.size,
      [field]: value === "" ? "" : Number(value),
    };
    onFilterChange({ size: newSize });
  };

  return (
    <div className="filters">
      <div className="filter-item">
        <label htmlFor="industry-select">Industry</label>
        <select
          id="industry-select"
          value={filters.industry}
          onChange={(e) => onFilterChange({ industry: e.target.value })}
        >
          <option value="">All Industries</option>
          {uniqueIndustries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-item size-filter">
        <label>Company Size</label>
        <div className="size-inputs">
          <input
            type="number"
            placeholder="0"
            value={filters.size.min}
            onChange={(e) => handleSizeChange("min", e.target.value)}
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="1000"
            value={filters.size.max}
            onChange={(e) => handleSizeChange("max", e.target.value)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

const SourceIcon: React.FC<{ source: string }> = ({ source }) => (
  <span className={`source-icon ${source.toLowerCase()}`}>
    {source.substring(0, 4).toUpperCase()}
  </span>
);

const SkeletonRow: React.FC<{ isEnriched: boolean }> = ({ isEnriched }) => (
  <tr className="skeleton-row">
    <td>
      <div
        className="skeleton-item"
        style={{ width: "45px", height: "28px" }}
      ></div>
    </td>
    <td>
      <div className="skeleton-item" style={{ width: "120px" }}></div>
    </td>
    <td>
      <div className="skeleton-item" style={{ width: "150px" }}></div>
    </td>
    <td>
      <div className="skeleton-item" style={{ width: "100px" }}></div>
    </td>
    <td>
      <div className="skeleton-item" style={{ width: "40px" }}></div>
    </td>
    {isEnriched && (
      <>
        <td>
          <div className="skeleton-item" style={{ width: "60px" }}></div>
        </td>
        <td>
          <div className="skeleton-item" style={{ width: "200px" }}></div>
        </td>
      </>
    )}
    <td>
      <div className="skeleton-item" style={{ width: "80px" }}></div>
    </td>
  </tr>
);

const LeadTable: React.FC<{
  leads: Lead[];
  loading: boolean;
  isEnriched: boolean;
}> = ({ leads, loading, isEnriched }) => (
  <div className="table-container">
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Name</th>
          <th>Company</th>
          <th>Industry</th>
          <th>Size</th>
          {isEnriched && (
            <>
              <th>Quality</th>
              <th>Summary</th>
            </>
          )}
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <SkeletonRow key={i} isEnriched={isEnriched} />
            ))
          : leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <SourceIcon source={lead.source} />
                </td>
                <td>{lead.name}</td>
                <td>{lead.company}</td>
                <td>{lead.industry}</td>
                <td>{lead.size}</td>
                {isEnriched && (
                  <>
                    <td>
                      {lead.quality === "Error" ? (
                        <span className="error-text">Failed</span>
                      ) : (
                        lead.quality || "..."
                      )}
                    </td>
                    <td>{lead.summary || "..."}</td>
                  </>
                )}
                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
      </tbody>
    </table>
  </div>
);

const SourcePieChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const COLORS = ["#238636", "#2F81F7", "#A371F7", "#DB6D28", "#484F58"];
  const sourceData = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(sourceData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={170}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "rgba(13, 17, 23, 0.9)",
            borderColor: "#30363D",
            borderRadius: "6px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const IndustryBarChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const industryData = leads.reduce((acc, lead) => {
    acc[lead.industry] = (acc[lead.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(industryData).map(([name, count]) => ({
    name,
    count,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="name" tick={{ fill: "#8B949E" }} />
        <YAxis tick={{ fill: "#8B949E" }} />
        <Tooltip
          contentStyle={{
            background: "rgba(13, 17, 23, 0.9)",
            borderColor: "#30363D",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Bar dataKey="count" name="Leads" fill="#58A6FF" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const ChartsView: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");
  return (
    <div className="charts-view-container">
      <div className="chart-toggle">
        <button
          onClick={() => setActiveChart("pie")}
          disabled={activeChart === "pie"}
        >
          By Source
        </button>
        <button
          onClick={() => setActiveChart("bar")}
          disabled={activeChart === "bar"}
        >
          By Industry
        </button>
      </div>
      <div className="chart-display-area">
        {activeChart === "pie" ? (
          <SourcePieChart leads={leads} />
        ) : (
          <IndustryBarChart leads={leads} />
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  loading: boolean;
}> = ({ title, value, loading }) => (
  <div className="stat-card card-style">
    <h3>{title}</h3>
    {loading ? (
      <div
        className="skeleton-item"
        style={{ height: "40px", width: "80%", margin: "0 auto" }}
      ></div>
    ) : (
      <p className="value gradient-text">{value}</p>
    )}
  </div>
);

// 4. Inlined CSS (from App.css)
const AppStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    :root {
        --background-color: #010409;
        --card-color: #0D1117;
        --border-color: rgba(255, 255, 255, 0.1);
        --text-primary: #E6EDF3;
        --text-secondary: #8B949E;
        --accent-primary: #58A6FF;
        --accent-hover: #79B8FF;
        --accent-gradient: linear-gradient(90deg, #58A6FF, #A371F7);
        --glow-color: rgba(88, 166, 255, 0.2);
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        background-color: var(--background-color);
        color: var(--text-primary);
        padding: 2rem;
        background-image: 
            radial-gradient(circle at 10% 20%, rgba(88, 166, 255, 0.1), transparent 35%),
            radial-gradient(circle at 90% 80%, rgba(163, 113, 247, 0.1), transparent 35%);
    }
    .app-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        animation: fadeIn 0.8s ease-out forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .app-header {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin-bottom: 2rem;
        padding: 0 1rem;
        animation: slideInDown 0.6s ease-out;
    }
    .app-header h1 {
        grid-column: 2 / 3;
        font-size: 2.25rem;
        font-weight: 900;
        letter-spacing: -1px;
        transition: filter 0.3s ease;
    }
    .app-header h1:hover {
        filter: drop-shadow(0 0 10px var(--glow-color));
    }
    .app-header .view-toggle {
        grid-column: 3 / 4;
        justify-self: end;
    }
    .gradient-text {
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .controls-container {
        display: flex;
        justify-content: space-between; /* Changed back to space-between */
        align-items: center;
        margin-bottom: 2rem;
        animation: slideInDown 0.7s ease-out;
    }
    .filters-wrapper {
        display: flex;
        gap: 2rem;
        align-items: center;
        background-color: var(--card-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem 2rem;
    }
    .filters {
        display: flex;
        gap: 2rem;
        align-items: flex-end;
    }
    .filter-item {
        display: flex;
        flex-direction: column;
    }
    .filter-item label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        font-weight: 500;
    }
    .filter-item select, .filter-item input[type="number"] {
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.8rem 1.2rem;
        border-radius: 6px;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .filter-item select:focus, .filter-item input[type="number"]:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
    }
    .filter-item select {
        width: 200px;
    }
    .filter-item input[type="number"] {
        width: 120px;
    }
    .filter-item.size-filter .size-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .view-toggle button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background-color: var(--card-color);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    .view-toggle button:first-child { border-radius: 6px 0 0 6px; }
    .view-toggle button:last-child { border-radius: 0 6px 6px 0; margin-left: -1px; }
    .view-toggle button:disabled {
        background-color: var(--accent-primary);
        color: #FFFFFF;
        border-color: var(--accent-primary);
    }
    .view-toggle button:hover:not(:disabled) {
        border-color: var(--text-secondary);
        background-color: #21262d;
    }
    .main-content-grid {
        display: grid;
        grid-template-columns: minmax(0, 2.5fr) minmax(0, 1fr);
        gap: 2rem;
        align-items: start;
        animation: slideInUp 0.8s ease-out;
    }
    .card-style {
        background-color: var(--card-color);
        border-radius: 8px;
        border: 1px solid var(--border-color);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card-style:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2), 0 0 15px var(--glow-color);
    }
    .content-view {
        height: 600px;
        display: flex;
        flex-direction: column;
    }
    .table-container {
        overflow-y: auto;
        height: 100%;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 1rem 1.5rem;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.9rem;
        white-space: nowrap;
    }
    thead th {
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.75rem;
        position: sticky;
        top: 0;
        background-color: var(--card-color);
        z-index: 1;
    }
    tbody tr:last-child td {
        border-bottom: none;
    }
    tbody tr {
        transition: background-color 0.2s ease;
    }
    tbody tr:hover {
        background-color: #1F242C;
    }
    .source-icon {
        display: inline-block;
        width: 45px;
        height: 28px;
        border-radius: 4px;
        text-align: center;
        line-height: 28px;
        font-weight: 600;
        font-size: 0.7rem;
        color: white;
    }
    .source-icon.organic { background-color: #238636; }
    .source-icon.ppc { background-color: #2F81F7; }
    .source-icon.referral { background-color: #A371F7; }
    .source-icon.email { background-color: #DB6D28; }
    .source-icon.social { background-color: #484F58; }
    .sidebar {
        position: sticky;
        top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    .stat-card {
        padding: 1.5rem;
        text-align: center;
    }
    .stat-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .stat-card .value {
        font-size: 2.25rem;
        font-weight: 700;
        margin: 0;
    }
    .charts-view-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: center;
    }
    .chart-toggle {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
        padding-top: 1rem;
    }
    .chart-toggle button {
        padding: 0.5rem 1.5rem;
        border: 1px solid var(--border-color);
        background-color: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-weight: 500;
    }
    .chart-toggle button:first-child { border-radius: 6px 0 0 6px; }
    .chart-toggle button:last-child { border-radius: 0 6px 6px 0; margin-left: -1px; }
    .chart-toggle button:disabled {
        background-color: var(--accent-primary);
        color: #FFFFFF;
        border-color: var(--accent-primary);
    }
    .chart-display-area {
        flex-grow: 1;
        width: 100%;
        margin: 0 auto;
    }
    .skeleton-item {
        background-color: #21262d;
        border-radius: 4px;
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .skeleton-row td > div {
        height: 20px;
        width: 90%;
    }
    @keyframes slideInDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .app-footer {
        text-align: center;
        padding: 4rem 2rem 2rem 2rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
        opacity: 0.6;
    }
    /* AI Enrichment Toggle */
    .actions-wrapper {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    .enrich-toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background-color: var(--card-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem 2rem;
    }
    .enrich-toggle label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        font-weight: 500;
        cursor: pointer;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }
    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider-switch {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        transition: .4s;
        border-radius: 24px;
    }
    .slider-switch:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: var(--text-secondary);
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider-switch {
        background-color: var(--accent-primary);
        border-color: var(--accent-primary);
    }
    input:checked + .slider-switch:before {
        transform: translateX(20px);
        background-color: white;
    }
    .error-text {
        color: #f85149;
        font-style: italic;
    }
    .refresh-btn {
        background-color: var(--card-color);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .refresh-btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
    }
    .refresh-btn svg {
        width: 20px;
        height: 20px;
    }
  `}</style>
);

// --- Main App Component ---

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
    <>
      <AppStyles />
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
    </>
  );
};

export default App;
