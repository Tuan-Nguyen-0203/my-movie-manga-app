import React from "react";

function SearchBar({ onSearch, className = "" }) {
  return (
    <input
      type="text"
      placeholder="Tìm kiếm..."
      className={`shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
      onChange={(e) => onSearch?.(e.target.value)}
    />
  );
}

export default SearchBar;
