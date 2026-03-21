import { useState } from "react";

export default function ExploreHeader({ onSearch }) {
  const [query, setQuery] = useState("");

  function handleKeyUp(e) {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  }

  function handleSearchClick() {
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <header className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-12">

      <p className="text-[10px] tracking-[0.4em] font-bold text-zinc-400 mb-4 uppercase">
        Exhibition Discovery 2026
      </p>

      <h2 className="text-5xl md:text-7xl serif leading-tight mb-12">
        Curating your <br />
        <span className="italic font-light opacity-50">
          next perspective.
        </span>
      </h2>

      <div className="relative max-w-2xl group">

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleKeyUp}
          placeholder="Search by city, name, or theme..."
          className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 py-6 pr-12 text-2xl outline-none focus:border-black dark:focus:border-white transition-all serif placeholder:text-zinc-300"
        />

        <button
          onClick={handleSearchClick}
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 hover:opacity-100 transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>

      </div>

    </header>
  );
}