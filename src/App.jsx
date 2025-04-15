// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MoviesPage from "./pages/MoviesPage";
import MangasPage from "./pages/MangasPage";

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="movies" element={<MoviesPage />} />
            <Route path="mangas" element={<MangasPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
