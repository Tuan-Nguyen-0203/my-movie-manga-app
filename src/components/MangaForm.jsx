import React, { useState, useEffect } from "react";

function MangaForm({ manga, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [genres, setGenres] = useState([]); // Thể loại
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("Đã đọc");
  const [link, setLink] = useState("");
  const [rate, setRate] = useState("");
  const [chapters, setChapters] = useState("");

  useEffect(() => {
    if (manga) {
      setName(manga.name || "");
      setGenres(Array.isArray(manga.genres) ? manga.genres : []);
      setCountry(manga.country || "");
      setStatus(manga.status || "Đã đọc");
      setLink(manga.link || "");
      setRate(manga.rate ? manga.rate.toString() : "");
      setChapters(manga.chapters ? manga.chapters.toString() : "");
    } else {
      setName("");
      setGenres([]);
      setCountry("");
      setStatus("Đã đọc");
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
      genres,
      country,
      status,
      link,
      rate: parseInt(rate),
      chapters: parseInt(chapters),
    };
    if (onSave) {
      onSave(newManga);
      if (onCancel) onCancel(); // Đóng modal và reset khi submit thành công
    }
  };

  // Xử lý chọn nhiều thể loại
  const genreOptions = [
    "Linh dị",
    "Thanh xuân vườn trường",
    "Xuyên thư",
    "Trinh thám",
    "Hài hước",
    "Hành động",
    "Lãng mạn",
    "Phiêu lưu",
    "Hiện đại",
    "Cận đại",
    "Cổ đại",
    "Trọng sinh",
    "Giả tưởng",
    "Mạt thế",
  ];
  const handleGenreChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setGenres(selected);
  };

  const countryOptions = [
    "Việt Nam",
    "Trung Quốc",
    "Hàn Quốc",
    "Thái Lan",
    "Nhật Bản",
  ];
  const statusOptions = ["Đang đọc", "Đang dịch", "Đã đọc", "Chưa đọc", "Sắp đọc"];
  const rateOptions = [1, 2, 3];

  return (
    <div className="fixed top-0 !mt-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-0 sm:p-0 rounded-md shadow-md w-full max-w-md h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <h2 className="text-2xl font-bold text-center text-blue-700">
            {manga ? "Sửa truyện" : "Thêm truyện"}
          </h2>
        </div>
        <form
          id="manga-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 py-2 space-y-4"
        >
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
              htmlFor="genres"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Thể loại:
            </label>
            <select
              id="genres"
              multiple
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={genres}
              onChange={handleGenreChange}
            >
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              (Giữ Ctrl hoặc Cmd để chọn nhiều)
            </div>
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Quốc gia:
            </label>
            <select
              id="country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Chọn quốc gia</option>
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
            <select
              id="rate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            >
              <option value="">Chọn rate</option>
              {rateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
        </form>
        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white p-4 border-t flex justify-end space-x-2">
          <button
            type="submit"
            form="manga-form"
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
      </div>
    </div>
  );
}

export default MangaForm;
