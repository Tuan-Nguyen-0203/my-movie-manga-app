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
    // Xác nhận trước khi xóa
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${sortedMovies.length} phim đã chọn?`
      )
    ) {
      return;
    }
    // Xoá tất cả record đang hiển thị (filtered từ cha)
    const idsToDelete = new Set(sortedMovies.map((m) => m.id || m._id));
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
      if (key === "name") {
        // Sắp xếp tiếng Việt chuẩn
        const cmp = (a.name || "").localeCompare(b.name || "", "vi", {
          sensitivity: "base",
        });
        return direction === "asc" ? cmp : -cmp;
      }
      if (key === "vietnameseName") {
        // So sánh tiếng Việt chuẩn cho tên phim
        const alphabet = [
          "a",
          "ă",
          "â",
          "b",
          "c",
          "d",
          "đ",
          "e",
          "ê",
          "g",
          "h",
          "i",
          "k",
          "l",
          "m",
          "n",
          "o",
          "ô",
          "ơ",
          "p",
          "q",
          "r",
          "s",
          "t",
          "u",
          "ư",
          "v",
          "x",
          "y",
        ];
        function getBaseChar(char) {
          return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
        function getCharOrder(char) {
          const base = getBaseChar(char);
          const idx = alphabet.indexOf(base);
          return idx === -1 ? 100 : idx;
        }
        function getAccentOrder(char) {
          const nfd = char.normalize("NFD");
          const accent = nfd.slice(1);
          if (!accent) return 0;
          if (accent.includes("\u0301")) return 1; // sắc
          if (accent.includes("\u0300")) return 2; // huyền
          if (accent.includes("\u0309")) return 3; // hỏi
          if (accent.includes("\u0303")) return 4; // ngã
          if (accent.includes("\u0323")) return 5; // nặng
          return 0;
        }
        function vietnameseCompare(aStr, bStr) {
          aStr = (aStr || "").toLowerCase().normalize("NFC");
          bStr = (bStr || "").toLowerCase().normalize("NFC");
          const minLen = Math.min(aStr.length, bStr.length);
          for (let i = 0; i < minLen; ++i) {
            const aChar = aStr[i];
            const bChar = bStr[i];
            if (aChar === bChar) continue;
            const aOrder = getCharOrder(aChar);
            const bOrder = getCharOrder(bChar);
            if (aOrder !== bOrder) return aOrder - bOrder;
            // Nếu chữ giống nhau, so sánh dấu
            const aAccent = getAccentOrder(aChar);
            const bAccent = getAccentOrder(bChar);
            if (aAccent !== bAccent) return aAccent - bAccent;
            // Nếu vẫn giống, fallback unicode
            if (aChar < bChar) return -1;
            if (aChar > bChar) return 1;
          }
          return aStr.length - bStr.length;
        }
        const cmp = vietnameseCompare(a.vietnameseName, b.vietnameseName);
        return direction === "asc" ? cmp : -cmp;
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortedMovies(sorted);
  };

  // Hàm lưu thứ tự hiện tại: chỉ cập nhật thứ tự mà không thay đổi dữ liệu gốc
  const handleSaveOrder = async () => {
    setSaveMsg("");
    try {
      // Lấy danh sách phim gốc
      const originalMovies = movies;
      // Tạo mảng mới chỉ chứa id và thứ tự
      const orderData = sortedMovies.map((movie, index) => ({
        id: movie.id,
        order: index,
      }));

      await fetch("http://localhost:3001/api/movies/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // Cập nhật lại sortedMovies để phản ánh thay đổi thứ tự
      const updatedMovies = [...originalMovies];
      orderData.forEach((item, index) => {
        const movie = updatedMovies.find((m) => m.id === item.id);
        if (movie) {
          movie.order = item.order;
        }
      });
      setSortedMovies(updatedMovies);

      setSaveMsg("✅ Đã lưu thứ tự thành công!");
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
        let color = "#9CA3AF"; // Gray-400 default
        let border = "#D1D5DB"; // Gray-300 default
        if (status === "Đã xem") {
          color = "#16A34A";
          border = "#86EFAC";
        } // Green-600/Green-300
        else if (status === "Sắp xem") {
          color = "#D97706";
          border = "#FBBF24";
        } // Orange-600/Yellow-400
        // Chưa xem giữ màu xám
        return (
          <span
            style={{
              display: "inline-block",
              padding: "0.15em 0.7em",
              fontWeight: 600,
              border: `1.5px solid ${border}`,
              borderRadius: "999px",
              color,
              background: "#fff",
              fontSize: 13,
              letterSpacing: 0.2,
            }}
          >
            {status}
          </span>
        );
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
        // Convert all '-' values to empty string/null for app
        Object.keys(item).forEach((key) => {
          if (item[key] === "-") item[key] = "";
        });
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
            item.id = `movie-${Date.now()}-${Math.floor(
              Math.random() * 1000000
            )}`;
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
          englishName:
            englishName == null || englishName === "" ? "-" : englishName,
          vietnameseName:
            vietnameseName == null || vietnameseName === ""
              ? "-"
              : vietnameseName,
          country: country == null || country === "" ? "-" : country,
          status: status == null || status === "" ? "-" : status,
          rate: rate == null || rate === "" ? "-" : rate,
          link: link == null || link === "" ? "-" : link,
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
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Xác nhận xoá
            </h2>
            <p className="mb-6 text-gray-700">
              Bạn có chắc chắn muốn xoá <b>{recordsToDelete.length}</b> phim
              đang hiển thị?
            </p>
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
