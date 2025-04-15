import React from "react";

function MovieCard({ movie, onDelete, onEdit }) {
  return (
    <div className="bg-white shadow rounded-md p-4">
      <h3 className="text-lg font-semibold">
        {movie.vietnameseName} ({movie.englishName})
      </h3>
      <p>Quốc gia: {movie.country}</p>
      <p>Tình trạng: {movie.status}</p>
      <p>Rate: {movie.rate}/5</p>
      <a
        href={movie.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline block mt-2"
      >
        Xem phim
      </a>
      <div className="mt-4 space-x-2">
        <button
          onClick={() => onEdit(movie.id)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(movie.id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export default MovieCard;
