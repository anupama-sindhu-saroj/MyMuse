import React, { useState, useEffect } from "react";

const AIChatBubble = ({ selectedMethod, onMethodRecommended }) => {
  const [aiMessage, setAiMessage] = useState("Analyzing your payment history...");
  const [userMessage] = useState("Pay for my ticket using my best method.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendation = async () => {
      try {
        // ✅ Get real amount from booking summary
        const bookingId = localStorage.getItem("pending_booking_id");
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        
        let rawAmount = 400; // fallback

        if (bookingId) {
          const summaryRes = await fetch(
            `http://localhost:8000/api/payment/summary?booking_id=${bookingId}`,
            { headers: { "Authorization": `Bearer ${token}` } }
          );
          if (summaryRes.ok) {
            const summary = await summaryRes.json();
            rawAmount = summary.amount / 100; // paise → rupees
          }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("http://localhost:8000/api/payment/recommend-method", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
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
        onMethodRecommended(data.recommended_method); // ✅ highlights correct box

      } catch (err) {
        console.error("AI recommendation failed:", err);
        const bookingId = localStorage.getItem("pending_booking_id");
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        let amount = 400;
        try {
          const res = await fetch(
            `http://localhost:8000/api/payment/summary?booking_id=${bookingId}`,
            { headers: { "Authorization": `Bearer ${token}` } }
          );
          if (res.ok) { const d = await res.json(); amount = d.amount / 100; }
        } catch {}
        
        const fallbackMsg = amount > 5000
          ? "Net Banking recommended for large amounts above ₹5000."
          : "UPI is recommended for fastest and most secure checkout.";
        const fallbackMethod = amount > 5000 ? "netbanking" : "upi";
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