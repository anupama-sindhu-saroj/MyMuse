import React from "react";

const AIStatusBar = ({ active }) => {

  if (!active) return null;

  return (
    <div className="mt-6 bg-black text-white px-6 py-4 rounded-lg text-center text-xs tracking-[0.25em] uppercase">

      ✔ AI Verification Complete • Securing Transaction

    </div>
  );
};

export default AIStatusBar;