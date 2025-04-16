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
    try {
      // Read file as arrayBuffer for xlsx
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const imported = XLSX.utils.sheet_to_json(sheet);
      // Check duplicates
      const existing = sortedMangas || [];
      const newItems = [];
      const duplicates = [];
      imported.forEach((item, idx) => {
        const name = (item.name || "").trim().toLowerCase();
        const country = (item.country || "").trim();
        const isDup = existing.some(
          (m) =>
            (m.name || "").trim().toLowerCase() === name &&
            (m.country || "").trim() === country
        );
        if (isDup) {
          duplicates.push({ ...item, row: idx + 2 }); // +2 for header row
        } else {
          newItems.push(item);
        }
      });
      if (newItems.length === 0) {
        setImportMsg(
          `❌ Tất cả truyện trong file đã tồn tại.\n` +
            (duplicates.length > 0
              ? `Trùng ở các dòng: ${duplicates.map((d) => d.row).join(", ")}`
              : "")
        );
        inputRef.current.value = "";
        return;
      }
      // Merge and trigger backend update
      const updated = [...existing, ...newItems];
      // Optionally: update backend via API (reuse update-order or similar)
      await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (duplicates.length > 0) {
        setImportMsg(
          `✅ Đã thêm ${newItems.length} truyện mới.\n❌ Bỏ qua ${
            duplicates.length
          } truyện trùng ở dòng: ${duplicates.map((d) => d.row).join(", ")}`
        );
      } else {
        setImportMsg(`✅ Đã thêm ${newItems.length} truyện mới.`);
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
      const exportData = filteredMangas.map(
        ({ name, country, status, rate, chapters, link }) => ({
          name,
          country,
          status,
          rate,
          chapters,
          link,
        })
      );
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
    let mergedOrder = [];
    if (view === "all") {
      mergedOrder = sortedMangas;
    } else {
      // Determine which status to update
      const isViewed = (status) =>
        ["Đã xem", "Đã đọc"].includes((status || "").trim());
      let filterFn = () => true;
      if (view === "viewed") filterFn = (m) => isViewed(m.status);
      if (view === "unviewed") filterFn = (m) => !isViewed(m.status);
      // Get all mangas not in current filtered set
      const filteredIds = new Set(filteredMangas.map((m) => m._id || m.id));
      // Merge: insert filteredMangas at positions of old filteredMangas, keep others in place
      let i = 0;
      mergedOrder = sortedMangas.map((m) => {
        if (filterFn(m)) {
          return filteredMangas[i++];
        } else {
          return m;
        }
      });
    }
    try {
      const res = await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedOrder),
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
      render: (manga) => {
        const status = (manga.status || "").trim();
        const statusColors = {
          "Đã xem": "#4CAF50",      // Green
          "Đã đọc": "#2196F3",      // Blue
          "Đang xem": "#FF9800",    // Orange
          "Đang đọc": "#00BCD4",    // Cyan
          "Bỏ dở": "#F44336",       // Red
          "Chưa xem": "#9E9E9E",    // Grey
          "Chưa đọc": "#9E9E9E"     // Grey
        };
        // Normalize status for display
        let display = status;
        if (["Đã xem", "Đã đọc"].includes(status)) display = status;
        else if (["Chưa xem", "Chưa đọc", ""].includes(status)) display = "Chưa xem";
        else if (["Đang xem", "Đang đọc"].includes(status)) display = status;
        else if (["Bỏ dở"].includes(status)) display = status;
        else display = status || "Chưa xem";
        const color = statusColors[display] || "#9E9E9E";
        return <span style={{ color, fontWeight: 600 }}>{display}</span>;
      },
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
  const isViewed = (status) =>
    ["Đã xem", "Đã đọc"].includes((status || "").trim());
  const filteredMangas = sortedMangas.filter((manga) => {
    if (view === "all") return true;
    if (view === "unviewed") return !isViewed(manga.status);
    return isViewed(manga.status);
  });

  return (
    <div className="h-[calc(100vh-230px)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSaveOrder}
          >
            Save Order
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

      {saveMsg && (
        <span
          className="text-sm font-semibold"
          style={{ color: saveMsg.startsWith("✅") ? "green" : "red" }}
        >
          {saveMsg}
        </span>
      )}
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
