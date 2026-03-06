import React from "react";

const PaymentMethods = ({ selected, onSelect }) => {

  const methods = [
    { id: "upi", title: "UPI / Google Pay", desc: "Instant authorization", ai: true },
    { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
    { id: "net", title: "Net Banking", desc: "All major Indian banks" }
  ];

  return (
    <div className="space-y-4">

      {methods.map((m) => (
        <div
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`p-6 border cursor-pointer transition
          ${
            selected === m.id
              ? "border-black bg-neutral-100 dark:border-white dark:bg-neutral-800"
              : "border-neutral-200 dark:border-neutral-700"
          }`}
        >

          <div className="flex justify-between items-center">

            <div>

              {m.ai && (
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-amber-600">
                  ● AI Recommended
                </span>
              )}

              <p className="font-sans text-lg font-medium dark:text-white">
                {m.title}
              </p>

              <p className="font-sans text-xs text-neutral-500">
                {m.desc}
              </p>

            </div>

            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center
              ${
                selected === m.id
                  ? "bg-black dark:bg-white border-black dark:border-white"
                  : "border-neutral-400"
              }`}
            />

          </div>

        </div>
      ))}

    </div>
  );
};

export default PaymentMethods;