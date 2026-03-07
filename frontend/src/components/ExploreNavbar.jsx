import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import Logo from "./Logo";

export default function ExploreNavbar() {

  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 z-50 glass-panel border-b">

      <Logo />

      <div className="flex items-center gap-6">

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full  hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* Book Tickets */}
        <Link
          to="/book"
          className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
        >
          Book Tickets
        </Link>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
        >
          Dashboard
        </Link>

        {/* Profile */}
        <div className="w-10 h-10 rounded-full border-2 border-black dark:border-white overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

    </nav>
  );
}