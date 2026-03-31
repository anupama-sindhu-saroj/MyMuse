import React, { useState, useEffect } from "react";

const AIChatBubble = ({ selectedMethod, onMethodRecommended }) => {
  const [aiMessage, setAiMessage] = useState("Analyzing your payment history...");
  const [userMessage] = useState("Pay for my ticket using my best method.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendation = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem("last_booking") || "{}");

        const rawAmount = cached.amount
          ? cached.amount / 100
          : cached.total_amount || 400;

        // ✅ 10s timeout — won't hang if Gemini is rate limited
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("http://localhost:8000/api/payment/recommend-method", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            user_message: userMessage,
            amount: rawAmount
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        setAiMessage(data.message);
        onMethodRecommended(data.recommended_method);

      } catch (err) {
        console.error("AI recommendation failed:", err);
        // ✅ Friendly fallback based on amount
        const cached = JSON.parse(localStorage.getItem("last_booking") || "{}");
        const amount = cached.total_amount || 0;
        const fallbackMsg = amount > 5000
          ? "Card payment recommended for amounts above ₹5000."
          : "UPI is recommended for fastest and most secure checkout.";
        const fallbackMethod = amount > 5000 ? "card" : "upi";

        setAiMessage(fallbackMsg);
        onMethodRecommended(fallbackMethod);
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