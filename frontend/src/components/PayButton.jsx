import React from "react";

const PayButton = ({ onClick, isLoading, amount }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-6 px-10 flex justify-between items-center
      bg-black text-white dark:bg-white dark:text-black
      transition active:scale-[0.98]"
    >

      <span className="font-sans text-sm font-semibold uppercase tracking-[0.3em]">
        {isLoading ? "Processing..." : `Pay ${amount}`}
      </span>

      {!isLoading && <span>→</span>}

    </button>
  );
};

export default PayButton;