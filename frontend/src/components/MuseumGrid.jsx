import MuseumCard from "./MuseumCard";

export default function MuseumGrid({ openDetails }) {

    const museums = [
        {
          city: "Delhi, IN",
          title: "National Science Museum",
          img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1000",
          desc: "A premier destination for tech lovers featuring robotics labs, immersive AI galleries, and interactive science exhibits for curious minds."
        },
        {
          city: "Mumbai, IN",
          title: "Art History Museum",
          img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000",
          desc: "Explore colonial, modern, and contemporary art movements that shaped Mumbai's cultural identity."
        },
        {
          city: "Paris, FR",
          title: "Modern Sculpture Pavilion",
          img: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&q=80&w=1000",
          desc: "A curated collection of bold contemporary sculptures blending geometry, motion, and conceptual design."
        },
        {
          city: "Tokyo, JP",
          title: "Future Tech Gallery",
          img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1000",
          desc: "Experience tomorrow's technology today through holographic displays, robotics, and immersive digital installations."
        },
        {
          city: "New York, US",
          title: "Metropolitan Heritage Hall",
          img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
          desc: "A historical journey through architecture, culture, and design that shaped modern metropolitan life."
        },
        {
          city: "Florence, IT",
          title: "Renaissance Art Archive",
          img: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?auto=format&fit=crop&q=80&w=1000",
          desc: "Home to preserved Renaissance masterpieces highlighting the artistic revolution of Florence."
        }
      ];

  return (
    <section className="col-span-12 lg:col-span-8">

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">

        {museums.map((m, i) => (
          <MuseumCard key={i} museum={m} openDetails={openDetails} />
        ))}

      </div>

    </section>
  );
}