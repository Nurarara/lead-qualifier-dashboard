import React from "react";
import type { Lead } from "../services/api";

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

export default LeadTable;
