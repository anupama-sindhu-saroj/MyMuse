import React, { useState, useEffect } from "react";

const AIChatBubble = ({ selectedMethod, onMethodRecommended }) => {
  const [aiMessage, setAiMessage] = useState("Analyzing your payment history...");
  const [userMessage] = useState("Pay for my ticket using my best method.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendation = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem("last_booking") || "{}");

        // ✅ handle both paise (amount) and rupees (total_amount)
        const rawAmount = cached.amount
          ? cached.amount / 100
          : cached.total_amount || 400;

        const res = await fetch("http://localhost:8000/api/payment/recommend-method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: userMessage,
            amount: rawAmount
          })
        });

        // ✅ check for server error before parsing
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        setAiMessage(data.message);
        onMethodRecommended(data.recommended_method);
      } catch {
        setAiMessage("Selecting UPI / Google Pay as it is fastest.");
        onMethodRecommended("upi"); // ✅ always set a fallback method
      } finally {
        setLoading(false);
      }
    };

    getRecommendation();
  }, []);

  return (
    <div className="space-y-2 mb-8">
      <div className="bg-neutral-800 text-white px-4 py-2 rounded-lg w-fit text-sm">
        [User]: {userMessage}
      </div>
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg w-fit text-sm">
        {loading ? "🤖 Analyzing..." : `[Museo AI]: ${aiMessage}`}
      </div>
    </div>
  );
};

export default AIChatBubble;