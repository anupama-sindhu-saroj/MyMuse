import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } 
    else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

  }, [darkMode]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="font-black tracking-tight text-lg dark:text-white">
          MUSEO<span className="text-neutral-400">.</span>
        </div>

        {/* Toggle */}
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