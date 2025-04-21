import { useState, useEffect } from "react";
import { useData } from "../hooks/useData";
import MangaForm from "../components/MangaForm";
import MangaList from "../components/MangaList";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

function MangasPage() {
  // Xoá nhiều record
  const handleDeleteMany = async (idsToDelete) => {
    // Lấy danh sách còn lại từ items gốc
    const remain = items.filter((m) => !idsToDelete.has(m.id || m._id));
    // Gửi lên backend cập nhật
    try {
      await fetch("http://localhost:3001/api/mangas/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remain),
      });
    } catch (e) {}
    // Cập nhật lại state (nếu useData không tự fetch lại)
    // Nếu useData có hàm reload, nên gọi reload();
    // Nếu không, có thể setItems(remain) nếu items là state local.
    // Nếu items là từ backend và tự động reload, không cần làm gì thêm.
  };
  const {
    items,
    filteredItems,
    searchTerm,
    statusFilter,
    countryFilter,
    rateFilter,
    handleSearch,
    handleFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    setSearchTerm,
    setStatusFilter,
    setCountryFilter,
    setRateFilter,
  } = useData("mangas");

  const [showForm, setShowForm] = useState(false);
  const [editingManga, setEditingManga] = useState(null);
  const [formError, setFormError] = useState("");

  const handleAddManga = (manga) => {
    // Duplicate check: name + country
    const exists = items.some(
      (m) =>
        m.name.trim().toLowerCase() === manga.name.trim().toLowerCase() &&
        m.country === manga.country
    );
    if (exists) {
      setFormError("❌ Truyện với tên và quốc gia này đã tồn tại!");
      return;
    }
    setFormError("");
    handleAdd({ ...manga, id: `manga-${Date.now()}` });
    setShowForm(false);
  };

  const handleEditManga = (manga) => {
    setEditingManga(manga);
    setShowForm(true);
  };

  // Khi cập nhật truyện xong, tự động đóng modal và reset state
  const handleUpdateAndClose = (manga) => {
    handleUpdate(manga);
    setShowForm(false);
    setEditingManga(null);
    setFormError("");
  };

  useEffect(() => {
    handleFilter();
  }, [countryFilter, statusFilter, rateFilter, items]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách truyện</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm truyện mới
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SearchBar onSearch={handleSearch} />
        <FilterDropdown
          label="Quốc gia"
          options={[
            "",
            ...Array.from(new Set((items || []).map((m) => m.country))).filter(
              Boolean
            ),
          ]}
          value={countryFilter}
          onChange={setCountryFilter}
        />
        <FilterDropdown
          label="Tình trạng"
          options={["", "Đang đọc", "Đang dịch", "Đã đọc", "Chưa đọc", "Sắp đọc"]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <MangaList
        mangas={filteredItems}
        onDelete={handleDelete}
        onEdit={handleEditManga}
        onDeleteMany={handleDeleteMany}
      />

      {showForm && (
        <>
          {formError && (
            <div className="text-red-500 text-center mb-2">{formError}</div>
          )}
          <MangaForm
            onSave={editingManga ? handleUpdateAndClose : handleAddManga}
            manga={editingManga}
            onCancel={() => {
              setShowForm(false);
              setEditingManga(null);
              setFormError("");
            }}
          />
        </>
      )}
    </div>
  );
}

export default MangasPage;
