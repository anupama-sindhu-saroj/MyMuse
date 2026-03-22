import { useState, useRef, useEffect } from "react";

export default function BookingChat({ setShow, setPrice }) {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "I have initialized the sequence for your visit. Which exhibit would you like to attend, and when would you like to visit?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { type: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
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

      // Update show and price in TicketSummary if booking data returned
      if (data.booking_data) {
        setBookingData(data.booking_data);
        if (data.booking_data.show_name) {
          setShow(data.booking_data.show_name);
        }
        if (data.booking_data.total_amount > 0) {
          setPrice(data.booking_data.total_amount);
        }
      }

      // If booking confirmed — create booking and redirect to payment
      if (
        data.booking_data?.confirmed &&
        data.booking_data?.show_name &&
        data.booking_data?.visit_date
      ) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", text: data.reply }
        ]);
        await createBookingAndRedirect(data.booking_data, token);
        return;
      }

      setMessages((prev) => [...prev, { type: "ai", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "I'm having trouble connecting right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createBookingAndRedirect = async (bData, token) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            show_id: bData.show_id || "show_000",
            show_name: bData.show_name,
            visit_date: bData.visit_date,
            time_slot: bData.time_slot,
            tickets: bData.tickets,
            total_amount: bData.total_amount
          })
        }
      );

      const result = await res.json();

      // Store booking_id and redirect to payment
      localStorage.setItem("pending_booking_id", result.booking_id);
      window.location.href = "/payment";
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Booking created but couldn't redirect to payment. Please go to the payment page manually."
        }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-8 pb-32">

      {/* Messages */}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.type === "user" ? "justify-end" : "gap-8"}`}
        >
          {msg.type === "ai" && (
            <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center font-bold text-white dark:text-black text-sm flex-shrink-0">
              α
            </div>
          )}
          <div
            className={`px-8 py-5 rounded-[30px] text-sm max-w-[80%] whitespace-pre-wrap ${
              msg.type === "user"
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-zinc-100 dark:bg-zinc-900"
            }`}
          >
            {msg.type === "ai" && i === 0 ? (
              <p className="text-2xl serif italic">{`"${msg.text}"`}</p>
            ) : (
              msg.text
            )}
          </div>
        </div>
      ))}

      {/* Loading */}
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

      {/* Booking summary card — shows when data is being collected */}
      {bookingData && bookingData.show_name && (
        <div className="ml-20 p-6 rounded-[20px] border border-zinc-200 dark:border-zinc-800 text-sm space-y-1">
          <p className="font-bold mb-2 text-xs tracking-widest uppercase opacity-50">
            Booking in progress
          </p>
          {bookingData.show_name && <p>🎭 {bookingData.show_name}</p>}
          {bookingData.visit_date && <p>📅 {bookingData.visit_date}</p>}
          {bookingData.time_slot && <p>🕐 {bookingData.time_slot}</p>}
          {bookingData.total_amount > 0 && (
            <p>💳 ₹{bookingData.total_amount}</p>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
