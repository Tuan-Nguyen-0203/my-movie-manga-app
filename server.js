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

// Paths to separate JSON files
const moviesPath = path.join(__dirname, "src", "assets", "movies.json");
const mangasPath = path.join(__dirname, "src", "assets", "mangas.json");

// Helper to get file path by type
function getFilePath(type) {
  if (type === "movies") return moviesPath;
  if (type === "mangas") return mangasPath;
  throw new Error("Invalid type");
}

// API endpoints

// Update manga order
app.post("/api/mangas/update-order", async (req, res) => {
  const newOrder = req.body;
  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ error: "Dữ liệu gửi lên phải là mảng manga." });
  }
  try {
    await fs.promises.writeFile(mangasPath, JSON.stringify(newOrder, null, 2));
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
    await fs.promises.writeFile(moviesPath, JSON.stringify(newOrder, null, 2));
    res.json({ message: "Cập nhật thứ tự movie thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật file dữ liệu." });
  }
});

// Get all data (optional, for backward compatibility)
app.get("/api/data", async (req, res) => {
  try {
    const movies = JSON.parse(await fs.promises.readFile(moviesPath, "utf8"));
    const mangas = JSON.parse(await fs.promises.readFile(mangasPath, "utf8"));
    res.json({ movies, mangas });
  } catch (error) {
    res.status(500).json({ error: "Không thể đọc file dữ liệu" });
  }
});

// Get data by type (movies or mangas)
app.get("/api/data/:type", async (req, res) => {
  const { type } = req.params;
  try {
    const filePath = getFilePath(type);
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Không thể đọc file dữ liệu" });
  }
});

// Update data by type
app.post("/api/data/:type", async (req, res) => {
  const { type } = req.params;
  const newData = req.body;
  try {
    const filePath = getFilePath(type);
    await fs.promises.writeFile(filePath, JSON.stringify(newData, null, 2));
    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật file dữ liệu" });
  }
});

// --- IMPORT EXCEL (movies/mangas) ---
app.post("/api/:type/import-excel", upload.single('file'), async (req, res) => {
  const { type } = req.params; // 'movies' hoặc 'mangas'
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const filePath = getFilePath(type);
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const dataFromExcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // Merge vào file riêng
    let currentData = [];
    try {
      currentData = JSON.parse(await fs.promises.readFile(filePath, "utf8"));
    } catch {}
    const merged = [...currentData, ...dataFromExcel];
    await fs.promises.writeFile(filePath, JSON.stringify(merged, null, 2));
    // Xoá file tạm
    fs.unlink(req.file.path, () => {});
    res.json({ message: `Imported ${dataFromExcel.length} ${type}` });
  } catch (error) {
    res.status(500).json({ error: "Import failed" });
  }
});

// --- EXPORT EXCEL (movies/mangas) ---
app.get("/api/:type/export-excel", async (req, res) => {
  const { type } = req.params; // 'movies' hoặc 'mangas'
  try {
    const filePath = getFilePath(type);
    let items = [];
    try {
      items = JSON.parse(await fs.promises.readFile(filePath, "utf8"));
    } catch {}
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
