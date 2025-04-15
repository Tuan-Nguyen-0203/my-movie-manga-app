import { useState } from "react";
import { useData } from "../hooks/useData";
import MangaForm from "../components/MangaForm";
import MangaList from "../components/MangaList";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

function MangasPage() {
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

  const handleAddManga = (manga) => {
    handleAdd({ ...manga, id: `manga-${Date.now()}` });
    setShowForm(false);
  };

  const handleEditManga = (manga) => {
    setEditingManga(manga);
    setShowForm(true);
  };

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
        <SearchBar value={searchTerm} onChange={handleSearch} />
        <FilterDropdown
          label="Quốc gia"
          options={Array.from(new Set(items.map((m) => m.country)))}
          value={countryFilter}
          onChange={setCountryFilter}
        />
        <FilterDropdown
          label="Tình trạng"
          options={["Chưa hoàn thành", "Hoàn thành", "Đã xem"]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <MangaList
        mangas={filteredItems}
        onDelete={handleDelete}
        onEdit={handleEditManga}
      />

      {showForm && (
        <MangaForm
          onSubmit={editingManga ? handleUpdate : handleAddManga}
          manga={editingManga}
          onCancel={() => {
            setShowForm(false);
            setEditingManga(null);
          }}
        />
      )}
    </div>
  );
}

export default MangasPage;
