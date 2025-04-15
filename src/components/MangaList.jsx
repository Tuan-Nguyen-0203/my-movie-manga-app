import React, { useState } from "react";
import Table from "./Table";

const MangaList = ({ mangas, onDelete, onEdit }) => {
  const [view, setView] = useState("all");

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

  // State lưu toàn bộ mangas đã sort UI
  const [sortedMangas, setSortedMangas] = useState(mangas);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [saveMsg, setSaveMsg] = useState("");

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

  const filteredMangas = mangas.filter((manga) => {
    if (view === "all") return true;
    if (view === "unviewed") return manga.status !== "Đã xem";
    return manga.status === "Đã xem";
  });

  return (
    <div>
      <div className="mb-4">
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
      <Table
        data={sortedMangas}
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        defaultSortColumn={sortConfig.key || "name"}
        defaultSortDirection={sortConfig.direction}
        onSort={handleSort}
      />
    </div>
  );
};

export default MangaList;
