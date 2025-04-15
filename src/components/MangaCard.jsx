import React from "react";

function MangaCard({ manga, onDelete, onEdit }) {
  return (
    <div className="bg-white shadow rounded-md p-4">
      <h3 className="text-lg font-semibold">{manga.name}</h3>
      <p>Quốc gia: {manga.country}</p>
      <p>Tình trạng: {manga.status}</p>
      <p>Rate: {manga.rate}/5</p>
      <p>Số chương: {manga.chapters}</p>
      <a
        href={manga.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline block mt-2"
      >
        Đọc truyện
      </a>
      <div className="mt-4 space-x-2">
        <button
          onClick={() => onEdit(manga.id)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(manga.id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export default MangaCard;
