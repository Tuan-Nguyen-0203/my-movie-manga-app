// src/components/Table.jsx

import React, { useState } from "react";

const Table = ({
  data,
  columns,
  onDelete,
  onEdit,
  onSort,
  sortConfig,
  // ...pagination nếu muốn giữ
}) => {
  // Pagination logic giữ nguyên nếu muốn
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header và Filter giữ nguyên nếu muốn */}
      <div className="border-b border-gray-200"></div>
      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 sticky top-0">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        onClick={() => onSort && onSort(column.key)}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                      >
                        {column.label}
                        {sortConfig && sortConfig.key === column.key && (
                          <span className="ml-2">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky right-0 bg-blue-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {column.render
                            ? column.render(item)
                            : item[column.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white">
                        <button
                          onClick={() => onEdit && onEdit(item)}
                          className="mr-4 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-300 hover:text-blue-900 transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(item.id)}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-300 hover:text-red-900 transition-colors shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination giữ nguyên nếu muốn */}
      {/* Footer */}
      <div className="border-t border-gray-200 sticky bottom-0 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="flex items-center space-x-4 text-black">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value={100}>100 records per page</option>
              <option value={200}>200 records per page</option>
              <option value={300}>300 records per page</option>
              <option value={500}>500 records per page</option>
            </select>
          </div>

          <div className="text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <span>
              {(() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(currentPage * pageSize, data.length);
                return `Showing ${start}-${end} of ${data.length} items`;
              })()}
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
