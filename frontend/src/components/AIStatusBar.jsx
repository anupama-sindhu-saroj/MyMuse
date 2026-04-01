import React from "react";

const AIStatusBar = ({ active, recommendedMethod }) => {
  if (!active) return null;

  const methodLabel = {
    upi: "UPI / Google Pay",
    card: "Credit / Debit Card",
    net: "Net Banking"
  }[recommendedMethod] || "Optimal Method";

  return (
    <div className="mt-6 bg-black text-white px-6 py-4 rounded-lg text-center text-xs tracking-[0.25em] uppercase">
      ✔ AI Verification Complete • Securing via {methodLabel}
    </div>
  );
};

export default AIStatusBar;