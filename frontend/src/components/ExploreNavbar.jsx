import { Link } from "react-router-dom";
export default function ExploreNavbar() {

    function toggleTheme() {
      document.documentElement.classList.toggle("dark");
    }
  
    return (
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 z-50 glass-panel border-b">
  
        <h1 className="text-2xl font-black tracking-tighter cursor-pointer">
          MUSEO.
        </h1>
  
        <div className="flex items-center gap-6">
  
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
  
            {/* moon */}
            <svg className="h-5 w-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
  
            {/* sun */}
            <svg className="h-5 w-5 hidden dark:block text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/>
            </svg>
  
          </button>
  
          <Link
            to="/book"
            className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
          >
            Book Tickets
          </Link>
  
          <div className="w-10 h-10 rounded-full border-2 border-black dark:border-white overflow-hidden shadow-md">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            className="w-full h-full object-cover"/>
          </div>
  
        </div>
  
      </nav>
    );
  }