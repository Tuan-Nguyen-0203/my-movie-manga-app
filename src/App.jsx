// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import MoviesPage from "./pages/MoviesPage";
import MangasPage from "./pages/MangasPage";
import SplitTextPage from "./pages/SplitTextPage";

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect from / to /movies */}
            <Route index element={<Navigate to="/movies" replace />} />
            <Route path="movies" element={<MoviesPage />} />
            <Route path="mangas" element={<MangasPage />} />
            <Route path="split-text" element={<SplitTextPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
