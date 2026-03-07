import React, { useContext } from "react";
import { Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {

  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Logo />

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          {darkMode ? (
            <Sun size={22} className="text-yellow-500" />
          ) : (
            <Moon size={22} className="text-neutral-700" />
          )}
        </button>

      </div>

    </nav>
  );
};

export default Navbar;