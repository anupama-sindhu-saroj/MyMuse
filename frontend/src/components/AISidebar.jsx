import { useState, useRef, useEffect } from "react";

export default function AISidebar({ externalMessage, onLocationDetected }) {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello! I'm Alpha. Ask me about museums near you, timings, prices, or current exhibitions anywhere in the world!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const bottomRef = useRef(null);
  const processedRef = useRef(null); // track last processed external message

  // Detect user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.county ||
            data.address?.state_district ||
            data.address?.state ||
            "your area";
            setLocation(city);
            onLocationDetected?.(city);
            setMessages((prev) => [
              ...prev,
              {
                type: "ai",
                text: `I can see you're near ${city}! I'm loading museums in your area.`
              }
            ]);
          } catch {
            const coords = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
            setLocation(coords);
            onLocationDetected?.(coords);
          }
        },
        () => {
          // Location denied — that's fine
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              text: "Tell me a city and I'll find the best museums there for you!"
            }
          ]);
        }
      );
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When header sends a search query to sidebar
  useEffect(() => {
    if (
      externalMessage &&
      externalMessage !== processedRef.current
    ) {
      processedRef.current = externalMessage;
      callApi(externalMessage);
    }
  }, [externalMessage]);

  async function callApi(text, userLocation = location) {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: "explore_guest",
          location: userLocation
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Sorry, I'm having trouble connecting. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    await callApi(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className="col-span-12 lg:col-span-4">
      <div className="glass-panel p-8 rounded-[40px] sticky top-32 shadow-xl border">

        <h3 className="text-xl font-bold mb-6">Curation Alpha</h3>

        <div className="space-y-4 mb-8 h-[500px] overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.type === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.type === "user"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl text-sm">
                <span className="animate-pulse">Alpha is searching...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find museums near me..."
            className="flex-1 border rounded-xl p-4 bg-transparent text-sm outline-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold disabled:opacity-40"
          >
            Ask
          </button>
        </div>

      </div>
    </aside>
  );
}