import { useState, useEffect, useRef, useContext } from "react";
import { Sun, Moon, ChevronDown, User, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ minimal = false, admin = null, onAdminLogout = null }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Don't read user from localStorage if we're in admin mode
    if (admin) return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [location.pathname, admin]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleAdminSignOut = () => {
    if (onAdminLogout) {
      onAdminLogout();
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("admin");
      navigate("/admin");
    }
    setDropdownOpen(false);
  };

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // Determine what profile to show — admin takes priority
  const activeProfile = admin || user;
  const isAdminMode = !!admin;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white text-black dark:bg-black dark:text-white border-b border-neutral-200 dark:border-neutral-800">
      <div
        className={`w-full max-w-[1400px] mx-auto px-10 h-20 flex items-center ${
          minimal ? "justify-end" : "justify-between"
        }`}
      >
        {/* Logo */}
        {!minimal && <Logo />}

        <div className="flex items-center gap-4">

          {/* Login buttons — only on homepage when not logged in and not admin */}
          {!minimal && isHomePage && !user && !admin && (
            <>
              <Link to="/userauth">
                <button className="px-5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                  User Login / Sign Up
                </button>
              </Link>
              <Link to="/museum-login">
                <button className="px-5 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition">
                  Museum Login / Sign Up
                </button>
              </Link>
            </>
          )}

          {/* Profile dropdown — user or admin */}
          {activeProfile && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 select-none">
                  {getInitials(activeProfile.name)}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {activeProfile.name?.split(" ")[0]}
                </span>
                {/* Admin badge */}
                {isAdminMode && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    Admin
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden z-50">

                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[12px] font-semibold text-neutral-700 dark:text-neutral-200 flex-shrink-0 select-none">
                      {getInitials(activeProfile.name)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate text-black dark:text-white">
                        {activeProfile.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {activeProfile.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-1">
                    {/* Admin-specific link */}
                    {isAdminMode ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        <User size={14} />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        <User size={14} />
                        My Profile
                      </Link>
                    )}

                    <button
                      onClick={isAdminMode ? handleAdminSignOut : handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dark mode toggle */}
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