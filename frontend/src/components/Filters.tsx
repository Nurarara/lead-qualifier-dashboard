import React from "react";

interface FiltersProps {
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
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  uniqueIndustries,
}) => {
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

export default Filters;
