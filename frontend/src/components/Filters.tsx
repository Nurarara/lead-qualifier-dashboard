import React from "react";

interface FiltersProps {
  filters: {
    industry: string;
    size: [number, number];
  };
  onFilterChange: (newFilters: Partial<FiltersProps["filters"]>) => void;
  uniqueIndustries: string[];
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  uniqueIndustries,
}) => (
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
    <div className="filter-item">
      <label htmlFor="size-range">
        Company Size: {filters.size[0]} - {filters.size[1]}
      </label>
      <input
        type="range"
        id="size-range"
        min="0"
        max="500"
        value={filters.size[1]}
        onChange={(e) =>
          onFilterChange({ size: [filters.size[0], Number(e.target.value)] })
        }
        className="slider"
      />
    </div>
  </div>
);

export default Filters;
