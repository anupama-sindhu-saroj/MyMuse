import React from "react";

const AIPaymentRecovery = ({ failedMethod, suggestion, visible }) => {

  if (!visible) return null;

  return (
    <div className="mt-6 border border-red-500/40 bg-red-500/10 rounded-xl p-5 space-y-3">

      <p className="text-red-400 font-semibold text-sm uppercase tracking-widest">
        Payment Failed
      </p>

      <p className="text-sm text-neutral-300">
        Payment failed using <span className="font-semibold">{failedMethod}</span>.
      </p>

      <p className="text-sm text-neutral-300">
        🤖 AI Suggestion: Try <span className="font-semibold text-green-400">{suggestion}</span> for faster success.
      </p>

      <button
        className="mt-2 px-4 py-2 text-xs uppercase tracking-widest bg-green-500 text-black rounded-md hover:bg-green-400 transition"
      >
        Switch to {suggestion}
      </button>

    </div>
  );
};

export default AIPaymentRecovery;