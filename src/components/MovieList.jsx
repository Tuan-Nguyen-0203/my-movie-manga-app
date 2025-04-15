import React, { useState } from "react";
import Table from "./Table";

const MovieList = ({ movies, onDelete, onEdit }) => {
  const [view, setView] = useState("all");

  // State lưu toàn bộ movies đã sort UI
  const [sortedMovies, setSortedMovies] = useState(movies);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [saveMsg, setSaveMsg] = useState("");

  // Khi movies prop thay đổi (thêm/xoá/sửa), cập nhật lại sortedMovies
  React.useEffect(() => {
    setSortedMovies(movies);
  }, [movies]);

  // Hàm sort: sort toàn bộ danh sách gốc
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sorted = [...sortedMovies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortedMovies(sorted);
  };

  // Hàm lưu thứ tự hiện tại: gửi đúng thứ tự đang hiển thị (filtered & sorted)
  const handleSaveOrder = async () => {
    setSaveMsg("");
    if (view !== "all") {
      setSaveMsg("❌ Chỉ lưu thứ tự khi xem tất cả!");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/movies/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sortedMovies),
      });
      const data = await res.json();
      if (res.ok) setSaveMsg("✅ Đã lưu thứ tự thành công!");
      else setSaveMsg("❌ " + (data.error || "Lỗi lưu thứ tự"));
    } catch (e) {
      setSaveMsg("❌ Lỗi lưu thứ tự!");
    }
  };

  // Filter chỉ để hiển thị, không ảnh hưởng đến thứ tự lưu
  const filteredMovies = sortedMovies.filter((movie) => {
    if (view === "all") return true;
    if (view === "unviewed") return movie.status !== "Đã xem";
    return movie.status === "Đã xem";
  });

  const columns = [
    { key: "englishName", label: "Tên tiếng Anh" },
    { key: "vietnameseName", label: "Tên tiếng Việt" },
    { key: "country", label: "Quốc gia" },
    {
      key: "status",
      label: "Tình trạng",
      render: (movie) => (movie.status === "Đã xem" ? "Đã xem" : "Chưa xem"),
    },
    { key: "rate", label: "Đánh giá" },
    {
      key: "link",
      label: "Link phim",
      render: (movie) => (
        <a href={movie.link} target="_blank" rel="noopener noreferrer">
          {movie.link}
        </a>
      ),
    },
  ];

  const [importMsg, setImportMsg] = useState("");
  const inputRef = React.useRef();

  const handleImport = async (e) => {
    setImportMsg("");
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/movies/import-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportMsg(`✅ ${data.message}`);
      } else {
        setImportMsg(`❌ ${data.error || "Import lỗi"}`);
      }
    } catch (err) {
      setImportMsg("❌ Import lỗi");
    }
    inputRef.current.value = "";
  };

  const handleExport = async () => {
    setImportMsg("");
    try {
      const res = await fetch("/api/movies/export-excel");
      if (!res.ok) throw new Error("Export lỗi");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "movies.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setImportMsg("❌ Export lỗi");
    }
  };

  return (
    <div className="h-[calc(100vh-280px)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="space-x-2 mb-2 sm:mb-0">
          <button
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded ${
              view === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setView("unviewed")}
            className={`px-4 py-2 rounded ${
              view === "unviewed" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Chưa xem
          </button>
          <button
            onClick={() => setView("viewed")}
            className={`px-4 py-2 rounded ${
              view === "viewed" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Đã xem
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            ref={inputRef}
            onChange={handleImport}
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => inputRef.current.click()}
          >
            Import Excel
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={handleExport}
          >
            Export Excel
          </button>
        </div>
      </div>
      {importMsg && (
        <div
          className="mb-4 text-sm font-semibold"
          style={{ color: importMsg.startsWith("✅") ? "green" : "red" }}
        >
          {importMsg}
        </div>
      )}
      <div className="flex items-center mb-2 gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSaveOrder}
          disabled={view !== "all"}
          title={view !== "all" ? "Chỉ lưu thứ tự khi xem tất cả" : ""}
        >
          Save Order
        </button>
        {saveMsg && (
          <span
            className="text-sm font-semibold"
            style={{ color: saveMsg.startsWith("✅") ? "green" : "red" }}
          >
            {saveMsg}
          </span>
        )}
      </div>
      <Table
        data={filteredMovies}
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default MovieList;
