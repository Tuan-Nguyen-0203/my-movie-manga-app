import { useState } from "react";

const MovieForm = ({ onSubmit, onCancel, movie = null }) => {
  const [formData, setFormData] = useState({
    id: movie?.id || "",
    englishName: movie?.englishName || "",
    vietnameseName: movie?.vietnameseName || "",
    country: movie?.country || "",
    status: movie?.status || "Chưa hoàn thành",
    link: movie?.link || "",
    rate: movie?.rate || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed !mt-0 top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {movie ? "Sửa phim" : "Thêm phim"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tiêu đề đã có sẵn ở trên */}
          <div>
            <label
              htmlFor="englishName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tên tiếng Anh:
            </label>
            <input
              type="text"
              id="englishName"
              name="englishName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.englishName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="vietnameseName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tên tiếng Việt:
            </label>
            <input
              type="text"
              id="vietnameseName"
              name="vietnameseName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vietnameseName}
              onChange={handleChange}
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
              name="country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.country}
              onChange={handleChange}
              required
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
              name="status"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Chưa hoàn thành">Chưa hoàn thành</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã xem">Đã xem</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="link"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Link phim:
            </label>
            <input
              type="text"
              id="link"
              name="link"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.link}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="rate"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Đánh giá:
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
              max="5"
              step="0.1"
              value={formData.rate}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-700"
              onClick={onCancel}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {movie ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
