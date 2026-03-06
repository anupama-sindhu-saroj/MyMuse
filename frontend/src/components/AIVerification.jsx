import React from "react";

const AIVerification = ({ active }) => {

  if (!active) return null;

  return (
    <div className="mt-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 shadow-lg text-xs space-y-1">

      <p>Account Balance: Verified</p>
      <p>Risk Profile: Low</p>
      <p>Fraud Pattern: No Match</p>

      <p className="text-green-500 font-semibold">
        ✔ Continuous verification active
      </p>

    </div>
  );
};

export default AIVerification;