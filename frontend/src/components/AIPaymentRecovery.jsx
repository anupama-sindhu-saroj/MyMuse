import React, { useState, useEffect } from "react";

const AIPaymentRecovery = ({ failedMethod, visible, onSwitchMethod }) => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const analyzeFailure = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/payment/analyze-failure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Payment could not be processed",
            method: failedMethod,
            code: "PAYMENT_FAILED"
          })
        });
        const data = await res.json();
        setAiData(data);
      } catch {
        setAiData({
          message: "Payment failed. Try a different method.",
          suggested_method: "card",
          success_rate: "87%"
        });
      } finally {
        setLoading(false);
      }
    };

    analyzeFailure();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="mt-6 border border-red-500/40 bg-red-500/10 rounded-xl p-5 space-y-3">

      <p className="text-red-400 font-semibold text-sm uppercase tracking-widest">
        Payment Failed
      </p>

      <p className="text-sm text-neutral-300">
        Payment failed using <span className="font-semibold">{failedMethod}</span>.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-400">🤖 AI analyzing failure reason...</p>
      ) : aiData && (
        <>
          {/* AI Diagnosis */}
          <p className="text-sm text-neutral-300">
            🤖 <span className="text-blue-400 font-semibold">AI Diagnosis:</span> {aiData.message}
          </p>

          {/* Success Rate */}
          {aiData.success_rate && (
            <p className="text-sm text-green-400">
              ✅ {aiData.suggested_method?.toUpperCase()} success rate: <span className="font-bold">{aiData.success_rate}</span>
            </p>
          )}

          {/* Switch Button */}
          <button
            onClick={() => onSwitchMethod(aiData.suggested_method)}
            className="mt-2 px-4 py-2 text-xs uppercase tracking-widest bg-green-500 text-black rounded-md hover:bg-green-400 transition"
          >
            Switch to {aiData.suggested_method}
          </button>
        </>
      )}
    </div>
  );
};

export default AIPaymentRecovery;