import React, { useState } from "react";
import Table from "./Table";
import SearchBar from "./SearchBar";

const MangaList = ({ mangas, onDelete, onEdit, onDeleteMany }) => {
  // State declarations (only once)
  const [sortedMangas, setSortedMangas] = useState(mangas);

  // Luôn đồng bộ state khi prop mangas thay đổi
  React.useEffect(() => {
    setSortedMangas(mangas);
  }, [mangas]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [saveMsg, setSaveMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordsToDelete, setRecordsToDelete] = useState([]);
  const inputRef = React.useRef();

  // Xoá nhiều record
  const handleDeleteMany = async () => {
    setShowDeleteModal(false);
    // Xoá tất cả record đang hiển thị (filtered từ cha)
    const idsToDelete = new Set(sortedMangas.map((m) => m.id || m._id));
    if (onDeleteMany) onDeleteMany(idsToDelete);
  };

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
        // Convert all '-' values to empty string/null for app
        Object.keys(item).forEach((key) => {
          if (item[key] === '-') item[key] = '';
        });
        const name = (item.name || "").trim().toLowerCase();
        const country = (item.country || "").trim();
        const isDup = existing.some(
          (m) => (m.name || "").trim().toLowerCase() === name && (m.country || "").trim() === country
        );
        if (!isDup) {
          newItems.push(item);
        } else {
          duplicates.push({ row: idx + 1, name, country });
        }
      });
      // Merge and trigger backend update
      const updated = [...existing, ...newItems];
      try {
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
        ({ name, genres, country, status, rate, chapters, link }) => ({
          name: name == null || name === '' ? '-' : name,
          genres: !genres || (Array.isArray(genres) && genres.length === 0) ? '-' : Array.isArray(genres) ? genres.join(', ') : genres,
          country: country == null || country === '' ? '-' : country,
          status: status == null || status === '' ? '-' : status,
          rate: rate == null || rate === '' ? '-' : rate,
          chapters: chapters == null || chapters === '' ? '-' : chapters,
          link: link == null || link === '' ? '-' : link,
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
      if (key === "name") {
      // So sánh tiếng Việt chuẩn cho tên truyện
      const alphabet = [
        "a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"
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
      const cmp = vietnameseCompare(a.name, b.name);
      return direction === "asc" ? cmp : -cmp;
    }  
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortedMangas(sorted);
  };


  // Hàm lưu thứ tự hiện tại: gửi toàn bộ sortedMangas lên backend
  const handleSaveOrder = async () => {
    setSaveMsg("");
    const mergedOrder = sortedMangas;
    try {
      await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedOrder),
      });
      setSaveMsg("✅ Đã lưu thứ tự thành công!");
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
        let color = "#EF4444"; // Red-400 default
        let border = "#f87171"; // Red-300 default
        if (status === "Đang đọc") {
          color = "#2563EB";
          border = "#60A5FA";
        } // Blue-600/Blue-400
        else if (status === "Đang dịch") {
          color = "#A21CAF";
          border = "#C7D2E7"; // Purple-100
        } // Purple-700/Purple-100
        else if (status === "Đã đọc") {
          color = "#16A34A";
          border = "#86EFAC";
        } // Green-600/Green-300
        else if (status === "Sắp dịch") {
          color = "#D97706";
          border = "#FBBF24";
        } // Orange-600/Yellow-400
        else if (status === "Đã dịch") {
          color = "#14B8A6";
          border = "#99F6E4";
        } // Teal-500/Teal-200
        // Chưa đọc giữ màu xám
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
    {
      key: "genres",
      label: "Thể loại",
      render: (manga) => (
        <span>
          {Array.isArray(manga.genres)
            ? manga.genres.join(", ")
            : manga.genres || ""}
        </span>
      ),
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

  // filteredMangas giờ chính là sortedMangas (đã filter từ cha)
  const filteredMangas = sortedMangas;

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
              setRecordsToDelete(filteredMangas);
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

      {/* Modal xác nhận xoá */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Xác nhận xoá
            </h2>
            <p className="mb-6 text-gray-700">
              Bạn có chắc chắn muốn xoá <b>{recordsToDelete.length}</b> truyện
              đang hiển thị?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteMany}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
