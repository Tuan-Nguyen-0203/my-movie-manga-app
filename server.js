import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import xlsx from "xlsx";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Multer config for file upload
const upload = multer({ dest: 'uploads/' });

// Path to JSON file
const dataPath = path.join(__dirname, "src", "assets", "data.json");

// Middleware to read JSON file
app.use(async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.promises.readFile(dataPath, "utf8"));
    req.data = data;
    next();
  } catch (error) {
    res.status(500).json({ error: "Không thể đọc file dữ liệu" });
  }
});

// API endpoints

// Update manga order
app.post("/api/mangas/update-order", async (req, res) => {
  const newOrder = req.body;
  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ error: "Dữ liệu gửi lên phải là mảng manga." });
  }
  try {
    const updatedData = {
      ...req.data,
      mangas: newOrder,
    };
    await fs.promises.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
    res.json({ message: "Cập nhật thứ tự manga thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật file dữ liệu." });
  }
});

// Update movie order
app.post("/api/movies/update-order", async (req, res) => {
  const newOrder = req.body;
  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ error: "Dữ liệu gửi lên phải là mảng movie." });
  }
  try {
    const updatedData = {
      ...req.data,
      movies: newOrder,
    };
    await fs.promises.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
    res.json({ message: "Cập nhật thứ tự movie thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật file dữ liệu." });
  }
});

app.get("/api/data", (req, res) => {
  res.json(req.data);
});

app.post("/api/data/:type", async (req, res) => {
  const { type } = req.params;
  const newData = req.body;

  try {
    const updatedData = {
      ...req.data,
      [type]: newData,
    };

    await fs.promises.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật file dữ liệu" });
  }
});

// --- IMPORT EXCEL (movies/books) ---
app.post("/api/:type/import-excel", upload.single('file'), async (req, res) => {
  const { type } = req.params; // 'movies' hoặc 'books'
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const dataFromExcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // Merge vào data.json
    const currentData = req.data[type] || [];
    const merged = [...currentData, ...dataFromExcel];
    const updatedData = { ...req.data, [type]: merged };
    await fs.promises.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
    // Xoá file tạm
    fs.unlink(req.file.path, () => {});
    res.json({ message: `Imported ${dataFromExcel.length} ${type}` });
  } catch (error) {
    res.status(500).json({ error: "Import failed" });
  }
});

// --- EXPORT EXCEL (movies/books) ---
app.get("/api/:type/export-excel", async (req, res) => {
  const { type } = req.params; // 'movies' hoặc 'books'
  try {
    const items = req.data[type] || [];
    const ws = xlsx.utils.json_to_sheet(items);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, type);
    const exportPath = path.join(__dirname, `${type}-export.xlsx`);
    xlsx.writeFile(wb, exportPath);
    res.download(exportPath, `${type}.xlsx`, err => {
      fs.unlink(exportPath, () => {});
    });
  } catch (error) {
    res.status(500).json({ error: "Export failed" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
