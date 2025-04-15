import React, { useState, useEffect } from "react";

function MangaForm({ manga, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("Chưa hoàn thành");
  const [link, setLink] = useState("");
  const [rate, setRate] = useState("");
  const [chapters, setChapters] = useState("");

  useEffect(() => {
    if (manga) {
      setName(manga.name || "");
      setCountry(manga.country || "");
      setStatus(manga.status || "Chưa hoàn thành");
      setLink(manga.link || "");
      setRate(manga.rate ? manga.rate.toString() : "");
      setChapters(manga.chapters ? manga.chapters.toString() : "");
    } else {
      setName("");
      setCountry("");
      setStatus("Chưa hoàn thành");
      setLink("");
      setRate("");
      setChapters("");
    }
  }, [manga]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newManga = {
      id: manga ? manga.id : null,
      name,
      country,
      status,
      link,
      rate: parseFloat(rate),
      chapters: parseInt(chapters),
    };
    onSave(newManga);
  };

  return (
    <div className="fixed top-0 !mt-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {manga ? "Sửa truyện" : "Thêm truyện"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tên truyện:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Quốc gia:
            </label>
            <input
              type="text"
              id="country"
              className="shadow appearance-none border rounded w-full appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tình trạng:
            </label>
            <select
              id="status"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Chưa hoàn thành">Chưa hoàn thành</option>
              <option value="Đã xem">Đã xem</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="link"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Link truyện:
            </label>
            <input
              type="text"
              id="link"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="rate"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Rate:
            </label>
            <input
              type="number"
              id="rate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
              max="5"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="chapters"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Số chương:
            </label>
            <input
              type="number"
              id="chapters"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="1"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {manga ? "Lưu" : "Thêm"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MangaForm;
