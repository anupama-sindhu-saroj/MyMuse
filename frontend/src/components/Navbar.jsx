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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white text-black dark:bg-black dark:text-white border-b border-neutral-200 dark:border-neutral-800">

      <div
        className={`w-full max-w-[1400px] mx-auto px-10 h-20 flex items-center ${
          minimal ? "justify-end" : "justify-between"
        }`}
      >

        {/* Logo */}
        {!minimal && <Logo />}

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Buttons only on homepage */}
          {!minimal && isHomePage && (
            <>
              {/* USER LOGIN / SIGNUP */}
              <Link to="/userauth">
                <button className="px-5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  User Login / Sign Up
                </button>
              </Link>

              {/* MUSEUM LOGIN / SIGNUP */}
              <Link to="/museum-login">
                <button className="px-5 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition">
                  Museum Login / Sign Up
                </button>
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
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