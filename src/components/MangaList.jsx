import React, { useState } from "react";
import Table from "./Table";
import SearchBar from "./SearchBar";

const MangaList = ({ mangas, onDelete, onEdit }) => {
  // State declarations (only once)
  const [view, setView] = useState("all");
  const [sortedMangas, setSortedMangas] = useState(mangas);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [saveMsg, setSaveMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const inputRef = React.useRef();

  const handleImport = async (e) => {
    setImportMsg("");
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:3001/api/mangas/import-excel", {
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
      // Dynamically import xlsx only when needed
      const XLSX = await import("xlsx");
      // Prepare data: only export filtered & sorted mangas
      const exportData = filteredMangas.map(({ name, country, status, rate, chapters, link }) => ({
        name, country, status, rate, chapters, link
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Mangas");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mangas.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setImportMsg("✅ Export thành công!");
    } catch (err) {
      setImportMsg("❌ Export lỗi");
    }
  };

  const handleMove = async (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === filteredMangas.length - 1)
    )
      return;
    const newList = [...filteredMangas];
    const temp = newList[index];
    newList[index] = newList[index + direction];
    newList[index + direction] = temp;
    // Gửi lên backend để lưu thứ tự mới
    try {
      await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newList),
      });
    } catch (e) {
      alert("Lỗi khi lưu thứ tự mới!");
    }
    // Không cần cập nhật state ở đây nếu cha sẽ reload lại danh sách
  };

  // Khi mangas prop thay đổi (thêm/xoá/sửa), cập nhật lại sortedMangas
  React.useEffect(() => {
    setSortedMangas(mangas);
  }, [mangas]);

  // Hàm sort: sort toàn bộ danh sách gốc
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sorted = [...sortedMangas].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortedMangas(sorted);
  };

  // Hàm lưu thứ tự hiện tại: gửi toàn bộ sortedMangas lên backend
  const handleSaveOrder = async () => {
    setSaveMsg("");
    try {
      const res = await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sortedMangas),
      });
      const data = await res.json();
      if (res.ok) setSaveMsg("✅ Đã lưu thứ tự thành công!");
      else setSaveMsg("❌ " + (data.error || "Lỗi lưu thứ tự"));
    } catch (e) {
      setSaveMsg("❌ Lỗi lưu thứ tự!");
    }
  };

  // Filter chỉ để hiển thị, không ảnh hưởng đến thứ tự lưu
  const columns = [
    { key: "name", label: "Tên truyện" },
    { key: "country", label: "Quốc gia" },
    {
      key: "status",
      label: "Tình trạng",
      render: (manga) => (manga.status === "Đã xem" ? "Đã xem" : "Chưa xem"),
    },
    { key: "rate", label: "Đánh giá" },
    { key: "chapters", label: "Chapters" },
    {
      key: "link",
      label: "Link truyện",
      render: (manga) => (
        <a href={manga.link} target="_blank" rel="noopener noreferrer">
          {manga.link}
        </a>
      ),
    },
  ];

  // Chỉ filter theo view (all, unviewed, viewed) trên danh sách đã sort
  const filteredMangas = sortedMangas.filter((manga) => {
    if (view === "all") return true;
    if (view === "unviewed") return manga.status !== "Đã xem";
    return manga.status === "Đã xem";
  });

  return (
    <div>
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
      <div className="flex items-center mb-2 gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSaveOrder}
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
      {importMsg && (
        <div
          className="mb-4 text-sm font-semibold"
          style={{ color: importMsg.startsWith("✅") ? "green" : "red" }}
        >
          {importMsg}
        </div>
      )}
      <Table
        data={filteredMangas}
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default MangaList;
