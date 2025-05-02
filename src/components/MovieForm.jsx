import { useState } from "react";

const MovieForm = ({ onSubmit, onCancel, movie = null }) => {
  const [formData, setFormData] = useState({
    id: movie?.id || "",
    englishName: movie?.englishName || "",
    vietnameseName: movie?.vietnameseName || "",
    country: movie?.country || "",
    status: movie?.status || "Chưa xem",
    link: movie?.link || "",
    rate: movie?.rate ? movie?.rate.toString() : "", // Chuyển đổi rate thành string khi load
    notes: movie?.notes || "", // Đảm bảo notes được set từ movie
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rate') {
      const parsedValue = Math.min(Math.max(parseInt(value), 0), 10);
      setFormData((prev) => ({
        ...prev,
        rate: parsedValue.toString() || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="fixed !mt-0 top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-0 sm:p-0 rounded-md shadow-md w-full max-w-md h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <h2 className="text-2xl font-bold text-center text-blue-700">
            {movie ? "Sửa phim" : "Thêm phim"}
          </h2>
        </div>
        <form id="movie-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
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
            <select
              id="country"
              name="country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="">Chọn quốc gia</option>
              <option value="Việt Nam">Việt Nam</option>
              <option value="Trung Quốc">Trung Quốc</option>
              <option value="Hàn Quốc">Hàn Quốc</option>
              <option value="Thái Lan">Thái Lan</option>
              <option value="Nhật Bản">Nhật Bản</option>
              <option value="Đài Loan">Đài Loan</option>
              <option value="Philip">Philip</option>
              <option value="Khác">Khác</option>
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
              name="status"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Đã xem">Đã xem</option>
              <option value="Đang xem">Đang xem</option>
              <option value="Chưa xem">Chưa xem</option>
              <option value="Sắp xem">Sắp xem</option>
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
              value={formData.rate}
              onChange={handleChange}
              min="0"
              max="10"
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Ghi chú (không hiển thị trong danh sách):
            </label>
            <textarea
              id="notes"
              name="notes"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Nhập các thông tin bổ sung không cần hiển thị trong danh sách..."
            ></textarea>
          </div>
        </form>
        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-700"
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            type="submit"
            form="movie-form"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {movie ? "Lưu" : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieForm;
