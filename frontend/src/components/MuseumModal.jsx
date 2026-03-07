import React from "react";

export default function MuseumModal({ modal, closeDetails }) {

  if (!modal.open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(10px)"
      }}
    >

      <div className="bg-white dark:bg-zinc-900 max-w-xl w-full p-10 rounded-[30px] shadow-2xl relative border border-zinc-200 dark:border-zinc-800">

        {/* Close button */}
        <button
          onClick={closeDetails}
          className="absolute top-5 right-5 text-xl opacity-50 hover:opacity-100"
        >
          ✕
        </button>

        <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase mb-4">
          Exhibition Overview
        </p>

        <h3 className="text-4xl serif mb-6">
          {modal.title}
        </h3>

        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {modal.desc}
        </p>

        <button
          className="mt-10 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Proceed to Booking
        </button>

      </div>

    </div>
  );
}