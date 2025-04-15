import React from "react";

function FilterDropdown({ label, options, onChange }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}:
      </label>
      <select
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option || `Tất cả ${label.toLowerCase()}`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterDropdown;
