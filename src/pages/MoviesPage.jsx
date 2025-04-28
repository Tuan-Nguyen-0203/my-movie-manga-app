import { useState, useEffect } from "react";
import { useData } from "../hooks/useData";
import MovieForm from "../components/MovieForm";
import MovieList from "../components/MovieList";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

function MoviesPage() {
  // Xoá nhiều record
  const handleDeleteMany = async (idsToDelete) => {
    // Lấy danh sách còn lại từ items gốc
    const remain = items.filter(m => !idsToDelete.has(m.id || m._id));
    // Gửi lên backend cập nhật
    try {
      await fetch("http://localhost:3001/api/movies/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remain),
      });
    } catch (e) {}
    // Cập nhật lại state (nếu useData không tự fetch lại)
    // Nếu useData có hàm reload, nên gọi reload();
    // Nếu không, có thể setItems(remain) nếu items là state local.
    // Nếu items là từ backend và tự động reload, không cần làm gì thêm.
  }
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
  } = useData("movies");

  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formError, setFormError] = useState("");

  const handleAddMovie = (movie) => {
    // Duplicate check: englishName + country
    const exists = items.some(
      (m) => m.englishName.trim().toLowerCase() === movie.englishName.trim().toLowerCase() && m.country === movie.country
    );
    if (exists) {
      setFormError("❌ Phim với tên tiếng Anh và quốc gia này đã tồn tại!");
      return;
    }
    setFormError("");
    handleAdd({ ...movie, id: `movie-${Date.now()}` });
    setShowForm(false);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  // Tự động filter lại khi countryFilter hoặc statusFilter thay đổi
  useEffect(() => {
    handleFilter();
  }, [countryFilter, statusFilter, rateFilter, items]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách phim</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm phim mới
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
          options={["", "Đã xem", "Chưa xem", "Sắp xem"]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <MovieList
        movies={filteredItems}
        onDelete={handleDelete}
        onEdit={handleEditMovie}
        onDeleteMany={handleDeleteMany}
      />

      {showForm && (
        <>
          {formError && (
            <div className="text-red-500 text-center mb-2">{formError}</div>
          )}
          <MovieForm
            onSubmit={editingMovie ? handleUpdate : handleAddMovie}
            movie={editingMovie}
            onCancel={() => {
              setShowForm(false);
              setEditingMovie(null);
              setFormError("");
            }}
          />
        </>
      )}
    </div>
  );
}

export default MoviesPage;
