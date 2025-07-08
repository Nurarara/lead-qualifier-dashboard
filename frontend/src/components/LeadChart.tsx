import React, { useState } from "react";
import type { Lead } from "../services/api";
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

export default ChartsView;
