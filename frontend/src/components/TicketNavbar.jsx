import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import Logo from "../components/Logo";
export default function TicketNavbar() {

  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 z-50 glass-nav border-b border-zinc-100 dark:border-zinc-900">
      <Logo />

      <div className="flex items-center gap-6 md:gap-10">

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full  hover:rotate-12 transition-transform"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* Explore */}
        <Link
          to="/explore"
          className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100"
        >
          Explore
        </Link>

        {/* Dashboard */}
        <Link
          to="/"
          className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100"
        >
          Dashboard
        </Link>

        {/* Profile */}
        <div className="w-10 h-10 rounded-full border border-black dark:border-white overflow-hidden p-0.5">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

      </div>
    </nav>
  );
}