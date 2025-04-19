import React, { useState } from "react";
import Table from "./Table";

const MovieList = ({ movies, onDelete, onEdit }) => {
  // State lưu toàn bộ movies đã sort UI
  const [sortedMovies, setSortedMovies] = useState(movies);

  // Luôn đồng bộ state khi prop movies thay đổi
  React.useEffect(() => {
    setSortedMovies(movies);
  }, [movies]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [saveMsg, setSaveMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordsToDelete, setRecordsToDelete] = useState([]);

  // Xoá nhiều record
  const handleDeleteMany = async () => {
    setShowDeleteModal(false);
    // Xoá tất cả record đang hiển thị (filtered từ cha)
    const idsToDelete = new Set(sortedMovies.map(m => m.id || m._id));
    if (onDeleteMany) onDeleteMany(idsToDelete);
  };



  // Khi movies prop thay đổi (thêm/xoá/sửa), cập nhật lại sortedMovies
  React.useEffect(() => {
    setSortedMovies(movies);
  }, [movies]);

  // filteredMovies giờ chính là sortedMovies (đã filter từ cha)
  const filteredMovies = sortedMovies;

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
    let mergedOrder = [];
    if (view === "all") {
      mergedOrder = sortedMovies;
    } else {
      // Determine which status to update
      const isViewed = (status) =>
        ["Đã xem", "Đã đọc"].includes((status || "").trim());
      let filterFn = () => true;
      if (view === "viewed") filterFn = (m) => isViewed(m.status);
      if (view === "unviewed") filterFn = (m) => !isViewed(m.status);
      // Get all movies not in current filtered set
      const filteredIds = new Set(filteredMovies.map((m) => m._id || m.id));
      const unchangedMovies = sortedMovies.filter(
        (m) => !filteredIds.has(m._id || m.id)
      );
      // Merge: insert filteredMovies at positions of old filteredMovies, keep others in place
      let i = 0;
      mergedOrder = sortedMovies.map((m) => {
        if (filterFn(m)) {
          return filteredMovies[i++];
        } else {
          return m;
        }
      });
    }
    try {
      const res = await fetch("http://localhost:3001/api/movies/update-order", {
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

  const columns = [
    { key: "englishName", label: "Tên tiếng Anh" },
    { key: "vietnameseName", label: "Tên tiếng Việt" },
    { key: "country", label: "Quốc gia" },
    {
      key: "status",
      label: "Tình trạng",
      render: (movie) => {
        const status = (movie.status || "").trim();
        const statusColors = {
          "Đã xem": "#4CAF50",      // Green
          "Đang xem": "#FF9800",    // Orange
          "Bỏ dở": "#F44336",       // Red
          "Chưa xem": "#9E9E9E"     // Grey
        };
        let display = status;
        if (["Đã xem"].includes(status)) display = status;
        else if (["Chưa xem", ""].includes(status)) display = "Chưa xem";
        else if (["Đang xem"].includes(status)) display = status;
        else if (["Bỏ dở"].includes(status)) display = status;
        else display = status || "Chưa xem";
        const color = statusColors[display] || "#9E9E9E";
        return <span style={{ color, fontWeight: 600 }}>{display}</span>;
      },
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
    try {
      // Read file as arrayBuffer for xlsx
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const imported = XLSX.utils.sheet_to_json(sheet);
      // Check duplicates
      const existing = sortedMovies || [];
      const newItems = [];
      const duplicates = [];
      imported.forEach((item, idx) => {
        const englishName = (item.englishName || "").trim().toLowerCase();
        const country = (item.country || "").trim();
        const isDup = existing.some(
          (m) =>
            (m.englishName || "").trim().toLowerCase() === englishName &&
            (m.country || "").trim() === country
        );
        if (isDup) {
          duplicates.push({ ...item, row: idx + 2 }); // +2 for header row
        } else {
          // Gán id nếu chưa có
          if (!item.id) {
            item.id = `movie-${Date.now()}-${Math.floor(Math.random()*1000000)}`;
          }
          newItems.push(item);
        }
      });
      if (newItems.length === 0) {
        setImportMsg(
          `❌ Tất cả phim trong file đã tồn tại.\n` +
            (duplicates.length > 0
              ? `Trùng ở các dòng: ${duplicates.map((d) => d.row).join(", ")}`
              : "")
        );
        inputRef.current.value = "";
        return;
      }
      // Merge and trigger backend update
      const updated = [...existing, ...newItems];
      await fetch("http://localhost:3001/api/movies/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (duplicates.length > 0) {
        setImportMsg(
          `✅ Đã thêm ${newItems.length} phim mới.\n❌ Bỏ qua ${
            duplicates.length
          } phim trùng ở dòng: ${duplicates.map((d) => d.row).join(", ")}`
        );
      } else {
        setImportMsg(`✅ Đã thêm ${newItems.length} phim mới.`);
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
      // Prepare data: only export filtered & sorted movies
      const exportData = filteredMovies.map(
        ({ englishName, vietnameseName, country, status, rate, link }) => ({
          englishName,
          vietnameseName,
          country,
          status,
          rate,
          link,
        })
      );
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Movies");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "movies.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setImportMsg("✅ Export thành công!");
    } catch (err) {
      setImportMsg("❌ Export lỗi");
    }
  };

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
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              setRecordsToDelete(filteredMovies);
              setShowDeleteModal(true);
            }}
          >
            Delete
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4 text-red-600">Xác nhận xoá</h2>
            <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn xoá <b>{recordsToDelete.length}</b> phim đang hiển thị?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Huỷ
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteMany}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
      {saveMsg && (
        <div className="flex items-center mb-2 gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: saveMsg.startsWith("✅") ? "green" : "red" }}
          >
            {saveMsg}
          </span>
        </div>
      )}
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
