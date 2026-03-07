import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const Navbar = () => {

  const location = useLocation();
  const isHomePage = location.pathname === "/";

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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">

      <div className="w-full px-10 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="font-black tracking-tight text-lg dark:text-white">
          MUSEO<span className="text-neutral-400">.</span>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* Show buttons only on home page */}
          {isHomePage && (
            <>
              {/* User Login */}
              <Link to="/login">
                <button className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  Login
                </button>
              </Link>

              {/* User Signup */}
              <Link to="/signup">
                <button className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:opacity-80 transition">
                  Sign Up
                </button>
              </Link>

              {/* Admin Login */}
              <Link to="/admin-login">
                <button className="px-4 py-2 text-sm border border-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  Admin
                </button>
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            {darkMode ? (
              <Sun size={22} className="text-yellow-500" />
            ) : (
              <Moon size={22} className="text-neutral-700 dark:text-white" />
            )}
          </button>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;