import React from "react";

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

export default StatCard;
