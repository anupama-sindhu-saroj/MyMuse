import React from "react";

const BookingSummary = () => {
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 rounded-sm">

      <h3 className="font-serif text-3xl mb-8 dark:text-white">
        Summary
      </h3>

      <div className="space-y-4 mb-8">

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Exhibition</span>
          <span className="font-medium dark:text-white">
            The Modern Wing:<br/>Curation Alpha
          </span>
        </div>

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Tickets</span>
          <span className="font-medium dark:text-white">
            1x Adult Admit
          </span>
        </div>

      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">

        <span className="font-sans text-xs uppercase tracking-[0.35em]">
          Total
        </span>

        <span className="font-serif text-3xl italic">
          ₹400.00
        </span>

      </div>

    </div>
  );
};

export default BookingSummary;