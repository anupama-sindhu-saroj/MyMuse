import { useState, useRef, useEffect } from "react";

export default function BookingChat({ setShow, setPrice, setBookingData, externalMessage, onMessageSent, finalizeBooking }) {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "I have initialized the sequence for your visit. Which museum would you like to visit?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [localBookingData, setLocalBookingData] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (externalMessage) {
      sendMessage(externalMessage);
      onMessageSent?.();
    }
  }, [externalMessage]);
 
  const sendMessage = async (text) => {
    const msg = text?.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { type: "user", text: msg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: msg,
          session_id: localStorage.getItem("user_id") || "guest",
          mode: "booking"
        })
      });

      const data = await res.json();

      if (data.booking_data) {
        setLocalBookingData(data.booking_data);
        setBookingData?.(data.booking_data);
        if (data.booking_data.show_name) setShow(data.booking_data.show_name);
        if (data.booking_data.total_amount > 0) setPrice(data.booking_data.total_amount);
      }
      if (data.ready_for_payment) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", text: data.reply },
          { type: "action", text: "Finalize & Pay" }
        ]);
        return;
      }

      setMessages((prev) => [
  ...prev,
  { type: "ai", text: data.reply || "No response from AI" }
]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "I'm having trouble connecting. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="space-y-8 pb-32">

{messages.map((msg, i) => (
  <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "gap-8"}`}>

    {msg.type === "ai" && msg.type !== "action" && (
      <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center font-bold text-white dark:text-black text-sm flex-shrink-0">
        α
      </div>
    )}

    {/* ✅ NORMAL MESSAGE */}
    {msg.type !== "action" && (
      <div className={`px-8 py-5 rounded-[30px] text-sm max-w-[80%] whitespace-pre-wrap ${
        msg.type === "user"
          ? "bg-black dark:bg-white text-white dark:text-black"
          : "bg-zinc-100 dark:bg-zinc-900"
      }`}>
        {msg.type === "ai" && i === 0
          ? <p className="text-2xl serif italic">{`"${msg.text}"`}</p>
          : msg.text
        }
      </div>
    )}

    {/* ✅ BUTTON OUTSIDE BUBBLE */}
    {msg.type === "action" && (
      <div className="ml-20">
        <button
          onClick={finalizeBooking}
          className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-80"
        >
          {msg.text}
        </button>
      </div>
    )}

  </div>
))}

      {loading && (
        <div className="flex gap-8">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center font-bold text-white dark:text-black text-sm flex-shrink-0">
            α
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 px-8 py-5 rounded-[30px] text-sm">
            <span className="animate-pulse">Alpha is thinking...</span>
          </div>
        </div>
      )}

      {localBookingData?.museum_name && (
        <div className="ml-20 p-6 rounded-[20px] border border-zinc-200 dark:border-zinc-800 text-sm space-y-1">
          <p className="font-bold mb-2 text-xs tracking-widest uppercase opacity-50">Booking in progress</p>
          {localBookingData.museum_name && <p>🏛 {localBookingData.museum_name}</p>}
          {localBookingData.show_name && <p>🎭 {localBookingData.show_name}</p>}
          {localBookingData.visit_date && <p>📅 {localBookingData.visit_date}</p>}
          {localBookingData.time_slot && <p>🕐 {localBookingData.time_slot}</p>}
          {localBookingData.total_amount > 0 && <p>💳 ₹{localBookingData.total_amount}</p>}
        </div>
        
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
