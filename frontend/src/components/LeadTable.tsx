import React from "react";
import type { Lead } from "../services/api";

// A new component to render a colored icon based on the lead source
const SourceIcon: React.FC<{ source: string }> = ({ source }) => (
  <span className={`source-icon ${source.toLowerCase()}`}>
    {source.substring(0, 4).toUpperCase()}
  </span>
);

const LeadTable: React.FC<{ leads: Lead[] }> = ({ leads }) => (
  <table>
    <thead>
      <tr>
        <th>Source</th>
        <th>Name</th>
        <th>Company</th>
        <th>Industry</th>
        <th>Size</th>
        {/* Removed Quality and Summary columns */}
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {leads.map((lead) => (
        <tr key={lead.id}>
          <td>
            <SourceIcon source={lead.source} />
          </td>
          <td>{lead.name}</td>
          <td>{lead.company}</td>
          <td>{lead.industry}</td>
          <td>{lead.size}</td>
          {/* Removed Quality and Summary data cells */}
          <td>{new Date(lead.created_at).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default LeadTable;
