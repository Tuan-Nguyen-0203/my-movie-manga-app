// src/components/Layout.jsx
import { Outlet, NavLink } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 aaaaa">
      {/* Sidebar */}
      <div className="w-32 bg-white shadow-lg">
        <div className="p-4">
          <NavLink
            to="/movies"
            className={({ isActive }) =>
              `block px-4 py-2 ${
                isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
              }`
            }
          >
            Phim
          </NavLink>
          <NavLink
            to="/mangas"
            className={({ isActive }) =>
              `block px-4 py-2 ${
                isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
              }`
            }
          >
            Truyện
          </NavLink>
          <NavLink
            to="/split-text"
            className={({ isActive }) =>
              `block px-4 py-2 ${
                isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
              }`
            }
          >
            Tách văn bản
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen w-[calc(100vw-128px)]">
        <div className="flex h-screen auto-rows-auto flex-col">
          {/* <div className="p-4">
            <div className="max-w-full overflow-hidden"> */}
          <div className="p-4">
            <Outlet />
          </div>
          {/* </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
