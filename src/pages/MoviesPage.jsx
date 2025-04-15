import { useState } from "react";
import { useData } from "../hooks/useData";
import MovieForm from "../components/MovieForm";
import MovieList from "../components/MovieList";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

function MoviesPage() {
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

  const handleAddMovie = (movie) => {
    handleAdd({ ...movie, id: `movie-${Date.now()}` });
    setShowForm(false);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

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

      <MovieList
        movies={filteredItems}
        onDelete={handleDelete}
        onEdit={handleEditMovie}
      />

      {showForm && (
        <MovieForm
          onSubmit={editingMovie ? handleUpdate : handleAddMovie}
          movie={editingMovie}
          onCancel={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
        />
      )}
    </div>
  );
}

export default MoviesPage;
