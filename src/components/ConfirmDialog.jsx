import { useState } from "react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Xác nhận", message = "Bạn có chắc chắn muốn thực hiện thao tác này?" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-red-600">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
