import React, { useContext } from "react";
import { Sun, Moon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import Logo from "./Logo";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ minimal = false }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 
    bg-white text-black 
    dark:bg-black dark:text-white
    border-b border-neutral-200 dark:border-neutral-800">

      <div
        className={`w-full max-w-[1400px] mx-auto px-10 h-20 flex items-center 
        ${minimal ? "justify-end" : "justify-between"}`}
      >

        {/* Logo (Hidden in minimal mode) */}
        {!minimal && <Logo />}

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Buttons only on homepage and not minimal */}
          {!minimal && isHomePage && (
            <>
              <Link to="/login">
                <button className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  Login
                </button>
              </Link>

              <Link to="/signup">
                <button className="px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition">
                  Sign Up
                </button>
              </Link>

              <Link to="/admin-login">
                <button className="px-4 py-2 text-sm border border-neutral-400 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  Admin
                </button>
              </Link>
            </>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            {darkMode ? (
              <Sun size={22} className="text-yellow-500" />
            ) : (
              <Moon size={22} />
            )}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;