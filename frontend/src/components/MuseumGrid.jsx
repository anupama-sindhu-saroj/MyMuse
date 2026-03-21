import { useState, useEffect, useRef } from "react";
import MuseumCard from "./MuseumCard";

// Static fallback cards — shown on page load, no API call needed
const DEFAULT_MUSEUMS = [
  {
    title: "National Museum",
    city: "New Delhi, India",
    desc: "India's largest museum with artifacts spanning 5000 years of history.",
    img: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&q=80&w=800",
    category: "history"
  },
  {
    title: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    city: "Mumbai, India",
    desc: "Premier art and history museum with an impressive collection of Indian art.",
    img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800",
    category: "art"
  },
  {
    title: "Indian Museum",
    city: "Kolkata, India",
    desc: "Oldest and largest museum in India with rare antiques and Mughal paintings.",
    img: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&q=80&w=800",
    category: "culture"
  },
  {
    title: "Salar Jung Museum",
    city: "Hyderabad, India",
    desc: "Houses one of the world's largest one-man collections of art and antiques.",
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
    category: "art"
  },
  {
    title: "Government Museum",
    city: "Chennai, India",
    desc: "One of the oldest museums in India with a vast collection of bronze sculptures.",
    img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
    category: "history"
  },
  {
    title: "Napier Museum",
    city: "Thiruvananthapuram, India",
    desc: "A natural history museum known for its Indo-Saracenic architecture and rare collections.",
    img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&q=80&w=800",
    category: "culture"
  }
];

export default function MuseumGrid({ openDetails, searchQuery, userLocation }) {
  const [museums, setMuseums] = useState(DEFAULT_MUSEUMS);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const lastQuery = useRef("");

  // Only call AI when user actively searches
  useEffect(() => {
    if (!searchQuery || searchQuery === lastQuery.current) return;
    lastQuery.current = searchQuery;
    fetchMuseums(searchQuery, userLocation);
  }, [searchQuery]);

  async function fetchMuseums(query, location) {
    setLoading(true);
    setLoadingText(`Searching for "${query}"...`);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/museums/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location: location || null })
      });

      const data = await res.json();
      if (data.museums && data.museums.length > 0) {
        setMuseums(data.museums);
      }
    } catch (err) {
      console.error("Search failed:", err);
      // Keep showing default museums on error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="col-span-12 lg:col-span-8">
        <p className="text-zinc-400 text-sm mb-8 animate-pulse">{loadingText}</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[340px] rounded-[32px] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-12 lg:col-span-8">
      {searchQuery && lastQuery.current && (
        <p className="text-zinc-400 text-sm mb-8">
          Results for <span className="text-black dark:text-white font-medium">"{searchQuery}"</span>
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
        {museums.map((museum, i) => (
          <MuseumCard key={i} museum={museum} openDetails={openDetails} />
        ))}
      </div>
    </section>
  );
}